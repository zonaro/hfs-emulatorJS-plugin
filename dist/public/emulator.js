'use strict';
{
    // EmulatorJS Plugin for HFS

    const pluginPublic = HFS.getPluginPublic();
    const config = HFS.getPluginConfig()


    const emuVersion = config.emulatorsJsVersion || 'stable'
    const iconTheme = config.iconTheme || 'monochrome';

    const DEBUG = false

    function debugLog(...args) {
        if (DEBUG) console.log(...args)
    }

    const EJS_CDN_BASE = 'https://cdn.emulatorjs.org/'
    const EJS_LOCAL_DATA_PATH = '/~/retro-emulator/data/'

    const ejsDataSource = config.ejsDataSource || emuVersion || 'stable'
    const ejsDataCustomUrl = config.ejsDataCustomUrl || ''

    debugLog('[EmulatorJS] frontend loaded', { emuVersion, ejsDataSource, iconTheme })

    function resolveEjsDataPath(source, customUrl) {
        switch (source) {
            case 'local':
                return EJS_LOCAL_DATA_PATH
            case 'custom': {
                const url = String(customUrl || '').trim()
                if (!url) return `${EJS_CDN_BASE}stable/data/`
                return url.endsWith('/') ? url : url + '/'
            }
            case 'latest':
            case 'nightly':
                return `${EJS_CDN_BASE}${source}/data/`
            case 'stable':
            default:
                return `${EJS_CDN_BASE}stable/data/`
        }
    }

    function splitCsv(value) {
        if (Array.isArray(value)) return value.map(String).map(s => s.trim()).filter(Boolean)
        return String(value || '').split(',').map(s => s.trim()).filter(Boolean)
    }

    function parseGamepadLayout(value) {
        if (!value) return []
        if (Array.isArray(value)) return value
        if (typeof value === 'string') {
            try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : [] }
            catch (err) { return [] }
        }
        return []
    }

    function normalizeConfigSystemMap(rows) {
        if (!Array.isArray(rows) || !rows.length) return null
        const builtinById = {}
        SYSTEM_MAP.forEach(entry => { builtinById[entry.system] = entry })
        return rows.map(row => {
            if (!row || !row.system) return null
            const system = String(row.system).trim()
            const builtin = builtinById[system]
            const extensions = splitCsv(row.extensions)
            const core = splitCsv(row.core)
            return {
                system,
                manufacturer: String(row.manufacturer || '').trim() || (builtin ? builtin.manufacturer : ''),
                name: String(row.name || '').trim() || (builtin ? builtin.name : system),
                extensions: extensions.length ? extensions : (builtin ? builtin.extensions.slice() : []),
                core: core.length ? core : (builtin ? builtin.core.slice() : []),
                icons: builtin ? builtin.icons.slice() : [],
                bios: String(row.bios || ''),
                aliases: splitCsv(row.aliases),
                artworkRepo: String(row.artworkRepo || ''),
                gamepadLayout: parseGamepadLayout(row.gamepadLayout),
            }
        }).filter(Boolean)
    }

    const configuredSystems = normalizeConfigSystemMap(config.systemMap)

    function getSystemsForFile(filename) {
        if (!configuredSystems) return getAllSystemsFromFile(filename)
        if (!filename) return []
        const ext = filename.indexOf('.') === -1 ? filename : filename.split('.').pop().toLowerCase()
        return configuredSystems.filter(platform => platform.extensions.includes(ext))
    }

    const activeExtensions = (() => {
        const set = new Set()
        ;(configuredSystems || SYSTEM_MAP).forEach(platform => {
            (platform.extensions || []).forEach(ext => set.add(ext))
        })
        return set
    })()

    function configuredPlatformsByExtension(extension) {
        return configuredSystems.filter(platform => platform.extensions.includes(extension.toLowerCase()))
    }

    function configuredPossiblePlatforms(text) {
        if (typeof text !== 'string') text = ''
        text = text.trim().toLowerCase()
        if (!text) return []

        const detected = {}
        function add(systemEntry, weight) {
            const w = weight || 1
            if (detected[systemEntry.system]) detected[systemEntry.system][1] += w
            else detected[systemEntry.system] = [systemEntry, w]
        }

        const words = []
        text.split(/[\\/]+/).map(part => part.trim()).filter(Boolean).forEach(part => {
            words.push(part)
            if (part.includes('.')) {
                const seg = part.split('.')
                const ext = seg.pop()
                const name = seg.join('.')
                if (name) words.push(name)
                if (ext) {
                    configuredPlatformsByExtension(ext).forEach(platform => add(platform, 2))
                    words.push(ext)
                }
            } else {
                part.split(' ').filter(Boolean).forEach(w => words.push(w))
            }
        })

        const uniq = Array.from(new Set(words))
        const norm = s => String(s || '').toLowerCase().split('_').join(' ').split('/').join(' ')

        configuredSystems.forEach(systemEntry => {
            const exactKeys = [systemEntry.system, systemEntry.name].concat(systemEntry.aliases || [])
                .map(norm).filter(Boolean)
            const looseKeys = [systemEntry.manufacturer, systemEntry.name, systemEntry.system]
                .concat(systemEntry.core, systemEntry.extensions)
                .map(norm).filter(Boolean)

            for (const word of uniq) {
                if (exactKeys.includes(word)) { add(systemEntry, 2); continue }
                for (const key of looseKeys) {
                    if (word.length > 3 && key.includes(word)) { add(systemEntry, 1); break }
                }
            }
        })

        return Object.values(detected)
            .sort((a, b) => b[1] - a[1])
            .filter(entry => entry[1] > 1)
            .map(entry => entry[0])
    }

    function activePossiblePlatforms(text) {
        if (!configuredSystems) return possiblePlatforms(text)
        return configuredPossiblePlatforms(text)
    }

    debugLog('[EmulatorJS] system map override', configuredSystems ? configuredSystems.length : 'built-in')

    function enforceLocalEmulatorJs() {
        if (window.__ejsLocalOnly) return
        window.__ejsLocalOnly = true

        const cdnHost = '//cdn.emulatorjs.org/'
        const deadHost = 'https://cdn.blocked.invalid/'

        function notifyBlocked() {
            if (window.__ejsLocalBlockedNotified) return
            window.__ejsLocalBlockedNotified = true
            try {
                HFS.toast('Local EmulatorJS is selected, but a required file is missing locally. CDN access is disabled.', 'error')
            } catch (err) {
                console.error('[EmulatorJS] notifyBlocked failed', err)
            }
        }

        function disableCdnFallback() {
            const emu = window.EJS_emulator
            if (!emu || !emu.downloadType) return false
            for (const key in emu.downloadType) {
                if (emu.downloadType[key]) emu.downloadType[key].cdnFallback = false
            }
            return true
        }

        if (!disableCdnFallback()) {
            let tries = 0
            const timer = setInterval(() => {
                if (disableCdnFallback() || ++tries > 100) clearInterval(timer)
            }, 100)
        }

        if (typeof window.fetch === 'function') {
            const origFetch = window.fetch
            window.fetch = function (input) {
                const url = typeof input === 'string' ? input : (input && input.url) || ''
                if (url.indexOf(cdnHost) !== -1) {
                    if (url.indexOf('version.json') !== -1) {
                        return Promise.resolve(new Response(null, { status: 404 }))
                    }
                    notifyBlocked()
                    return Promise.reject(new Error('EmulatorJS CDN disabled (local mode)'))
                }
                return origFetch.apply(this, arguments)
            }
        }

        if (window.XMLHttpRequest && window.XMLHttpRequest.prototype) {
            const origOpen = window.XMLHttpRequest.prototype.open
            window.XMLHttpRequest.prototype.open = function (method, url) {
                if (String(url).indexOf(cdnHost) !== -1) {
                    notifyBlocked()
                    arguments[1] = deadHost
                }
                return origOpen.apply(this, arguments)
            }
        }
    }

    const BIOS_MAP = {
        pcsx_rearmed: 'scph5501.bin',
        mednafen_psx_hw: 'scph5501.bin',
        yabause: 'sega_101.bin',
        mednafen_pce: 'syscard3.pce',
        mednafen_pcfx: 'pcfx.rom',
        mednafen_ngp: 'ngp.rom',
        mednafen_wswan: 'wonderswan.rom',
        a5200: '5200.rom',
        opera: 'panafz10.bin',
        melonds: 'bios7.bin',
        desmume2015: 'bios7.bin'
    }

    const GP_2BUTTON = [
        { type: 'button', text: 'B', id: 'b', location: 'right', right: 75, top: 70, bold: true, input_value: 0 },
        { type: 'button', text: 'A', id: 'a', location: 'right', right: 5, top: 70, bold: true, input_value: 8 },
        { type: 'dpad', id: 'dpad', location: 'left', left: '50%', right: '50%', joystickInput: false, inputValues: [4, 5, 6, 7] },
        { type: 'button', text: 'Start', id: 'start', location: 'right', right: 5, top: -100, fontSize: 15, block: true, input_value: 3 },
        { type: 'button', text: 'Select', id: 'select', location: 'right', right: 75, top: -100, fontSize: 15, block: true, input_value: 2 }
    ]

    const GP_4BUTTON = [
        { type: 'button', text: 'X', id: 'x', location: 'right', left: 45, top: 0, bold: true, input_value: 9 },
        { type: 'button', text: 'Y', id: 'y', location: 'right', left: 5, top: 40, bold: true, input_value: 1 },
        { type: 'button', text: 'A', id: 'a', location: 'right', left: 85, top: 40, bold: true, input_value: 8 },
        { type: 'button', text: 'B', id: 'b', location: 'right', left: 45, top: 80, bold: true, input_value: 0 },
        { type: 'dpad', id: 'dpad', location: 'left', left: '50%', top: '25%', joystickInput: false, inputValues: [4, 5, 6, 7] },
        { type: 'button', text: 'Start', id: 'start', location: 'right', right: 70, top: -100, fontSize: 15, block: true, input_value: 3 },
        { type: 'button', text: 'Select', id: 'select', location: 'left', left: 70, top: -100, fontSize: 15, block: true, input_value: 2 },
        { type: 'button', text: 'L', id: 'l', location: 'left', left: 3, top: -100, bold: true, block: true, input_value: 10 },
        { type: 'button', text: 'R', id: 'r', location: 'right', right: 3, top: -100, bold: true, block: true, input_value: 11 }
    ]

    const GP_AZAHAR = [
        { type: 'button', text: 'X', id: 'x', location: 'right', left: 45, top: 0, bold: true, input_value: 9 },
        { type: 'button', text: 'Y', id: 'y', location: 'right', left: 5, top: 40, bold: true, input_value: 1 },
        { type: 'button', text: 'A', id: 'a', location: 'right', left: 85, top: 40, bold: true, input_value: 8 },
        { type: 'button', text: 'B', id: 'b', location: 'right', left: 45, top: 80, bold: true, input_value: 0 },
        { type: 'dpad', id: 'dpad', location: 'left', left: '50%', top: '50%', joystickInput: false, inputValues: [4, 5, 6, 7] },
        { type: 'button', text: 'Start', id: 'start', location: 'right', right: 70, top: -100, fontSize: 15, block: true, input_value: 3 },
        { type: 'button', text: 'Select', id: 'select', location: 'left', left: 70, top: -100, fontSize: 15, block: true, input_value: 2 },
        { type: 'button', text: 'L', id: 'l', location: 'left', left: 3, top: -100, bold: true, block: true, input_value: 10 },
        { type: 'button', text: 'R', id: 'r', location: 'right', right: 3, top: -100, bold: true, block: true, input_value: 11 }
    ]

    const GP_MGBA = [
        { type: 'button', text: 'B', id: 'b', location: 'right', right: 75, top: 70, bold: true, input_value: 0 },
        { type: 'button', text: 'A', id: 'a', location: 'right', right: 5, top: 70, bold: true, input_value: 8 },
        { type: 'dpad', id: 'dpad', location: 'left', left: '50%', top: '50%', joystickInput: false, inputValues: [4, 5, 6, 7] },
        { type: 'button', text: 'Start', id: 'start', location: 'right', right: 70, top: -100, fontSize: 15, block: true, input_value: 3 },
        { type: 'button', text: 'Select', id: 'select', location: 'left', left: 70, top: -100, fontSize: 15, block: true, input_value: 2 },
        { type: 'button', text: 'L', id: 'l', location: 'left', left: 3, top: -100, bold: true, block: true, input_value: 10 },
        { type: 'button', text: 'R', id: 'r', location: 'right', right: 3, top: -100, bold: true, block: true, input_value: 11 }
    ]

    const GP_N64 = [
        { type: 'button', text: 'B', id: 'b', location: 'right', left: 10, top: 95, input_value: 1, bold: true },
        { type: 'button', text: 'A', id: 'a', location: 'right', left: 80, top: 95, input_value: 0, bold: true },
        { type: 'zone', id: 'stick', location: 'left', left: '50%', top: '100%', joystickInput: true, inputValues: [16, 17, 18, 19] },
        { type: 'zone', id: 'dpad', location: 'left', left: '50%', top: '0%', joystickInput: false, inputValues: [4, 5, 6, 7] },
        { type: 'button', text: 'Start', id: 'start', location: 'top', right: 80, top: -40, fontSize: 15, block: true, input_value: 3 },
        { type: 'button', text: 'L', id: 'l', block: true, location: 'top', left: 10, top: -40, bold: true, input_value: 10 },
        { type: 'button', text: 'R', id: 'r', block: true, location: 'top', right: 10, top: -40, bold: true, input_value: 11 },
        { type: 'button', text: 'Z', id: 'z', block: true, location: 'top', left: 80, top: -40, bold: true, input_value: 12 },
        { fontSize: 20, type: 'button', text: 'CU', id: 'cu', joystickInput: true, location: 'right', left: 45, top: -65, input_value: 23 },
        { fontSize: 20, type: 'button', text: 'CD', id: 'cd', joystickInput: true, location: 'right', left: 45, top: 15, input_value: 22 },
        { fontSize: 20, type: 'button', text: 'CL', id: 'cl', joystickInput: true, location: 'right', left: 5, top: -25, input_value: 21 },
        { fontSize: 20, type: 'button', text: 'CR', id: 'cr', joystickInput: true, location: 'right', left: 85, top: -25, input_value: 20 }
    ]

    const GP_BEETLE_VB = [
        { type: 'button', text: 'B', id: 'b', location: 'right', right: 75, top: 70, bold: true, input_value: 0 },
        { type: 'button', text: 'A', id: 'a', location: 'right', right: 5, top: 70, bold: true, input_value: 8 },
        { type: 'dpad', id: 'dpad', location: 'left', left: '50%', top: '50%', joystickInput: false, inputValues: [4, 5, 6, 7] },
        { type: 'button', text: 'Start', id: 'start', location: 'right', right: 70, top: -100, fontSize: 15, block: true, input_value: 3 },
        { type: 'button', text: 'Select', id: 'select', location: 'left', left: 70, top: -100, fontSize: 15, block: true, input_value: 2 },
        { type: 'button', text: 'L', id: 'l', location: 'left', left: 3, top: -100, bold: true, block: true, input_value: 10 },
        { type: 'button', text: 'R', id: 'r', location: 'right', right: 3, top: -100, bold: true, block: true, input_value: 11 }
    ]

    const GP_GENESIS = [
        { type: 'button', text: 'A', id: 'a', location: 'right', right: 90, top: 100, bold: true, input_value: 0 },
        { type: 'button', text: 'B', id: 'b', location: 'right', right: 40, top: 70, bold: true, input_value: 8 },
        { type: 'button', text: 'C', id: 'c', location: 'right', right: -10, top: 40, bold: true, input_value: 11 },
        { type: 'button', text: 'X', id: 'x', location: 'right', right: 90, top: 30, bold: true, input_value: 1 },
        { type: 'button', text: 'Y', id: 'y', location: 'right', right: 40, top: 0, bold: true, input_value: 9 },
        { type: 'button', text: 'Z', id: 'z', location: 'right', right: -10, top: -30, bold: true, input_value: 10 },
        { type: 'dpad', id: 'dpad', location: 'left', left: '50%', right: '50%', joystickInput: false, inputValues: [4, 5, 6, 7] },
        { type: 'button', text: 'L', id: 'l', location: 'left', left: 3, top: -100, bold: true, block: true, input_value: 12 },
        { type: 'button', text: 'R', id: 'r', location: 'right', right: 3, top: -100, bold: true, block: true, input_value: 13 },
        { type: 'button', text: 'Select', id: 'select', location: 'left', left: 70, top: -100, fontSize: 15, block: true, input_value: 2 },
        { type: 'button', text: 'Start', id: 'start', location: 'right', right: 70, top: -100, fontSize: 15, block: true, input_value: 3 }
    ]

    const GP_YABAUSE = [
        { type: 'button', text: 'A', id: 'a', location: 'right', right: 90, top: 100, bold: true, input_value: 0 },
        { type: 'button', text: 'B', id: 'b', location: 'right', right: 40, top: 70, bold: true, input_value: 8 },
        { type: 'button', text: 'C', id: 'c', location: 'right', right: -10, top: 40, bold: true, input_value: 10 },
        { type: 'button', text: 'X', id: 'x', location: 'right', right: 90, top: 30, bold: true, input_value: 1 },
        { type: 'button', text: 'Y', id: 'y', location: 'right', right: 40, top: 0, bold: true, input_value: 9 },
        { type: 'button', text: 'Z', id: 'z', location: 'right', right: -10, top: -30, bold: true, input_value: 11 },
        { type: 'dpad', id: 'dpad', location: 'left', left: '50%', right: '50%', joystickInput: false, inputValues: [4, 5, 6, 7] },
        { type: 'button', text: 'L', id: 'l', location: 'left', left: 3, top: -100, bold: true, block: true, input_value: 12 },
        { type: 'button', text: 'R', id: 'r', location: 'right', right: 3, top: -100, bold: true, block: true, input_value: 13 },
        { type: 'button', text: 'Select', id: 'select', location: 'left', left: 70, top: -100, fontSize: 15, block: true, input_value: 2 },
        { type: 'button', text: 'Start', id: 'start', location: 'right', right: 70, top: -100, fontSize: 15, block: true, input_value: 3 }
    ]

    const GP_PSX = [
        { type: 'button', text: '△', id: 'triangle', location: 'right', left: 40, bold: true, input_value: 9 },
        { type: 'button', text: '□', id: 'square', location: 'right', top: 40, bold: true, input_value: 1 },
        { type: 'button', text: '○', id: 'circle', location: 'right', left: 80, top: 40, bold: true, input_value: 8 },
        { type: 'button', text: '✕', id: 'cross', location: 'right', left: 40, top: 80, bold: true, input_value: 0 },
        { type: 'dpad', id: 'dpad', location: 'left', left: '50%', top: '50%', joystickInput: false, inputValues: [4, 5, 6, 7] },
        { type: 'button', text: 'Start', id: 'start', location: 'right', right: 70, top: -100, fontSize: 15, block: true, input_value: 3 },
        { type: 'button', text: 'Select', id: 'select', location: 'left', left: 70, top: -100, fontSize: 15, block: true, input_value: 2 },
        { type: 'button', text: 'L1', id: 'l1', location: 'left', left: 3, top: -100, bold: true, block: true, input_value: 10 },
        { type: 'button', text: 'R1', id: 'r1', location: 'right', right: 3, top: -100, bold: true, block: true, input_value: 11 }
    ]

    const GP_PPSSPP = [
        { type: 'button', text: '△', id: 'triangle', location: 'right', left: 40, bold: true, input_value: 9 },
        { type: 'button', text: '□', id: 'square', location: 'right', top: 40, bold: true, input_value: 1 },
        { type: 'button', text: '○', id: 'circle', location: 'right', left: 80, top: 40, bold: true, input_value: 8 },
        { type: 'button', text: '✕', id: 'cross', location: 'right', left: 40, top: 80, bold: true, input_value: 0 },
        { type: 'zone', id: 'stick', location: 'left', left: '50%', top: '50%', joystickInput: true, inputValues: [16, 17, 18, 19] },
        { type: 'dpad', id: 'dpad', location: 'left', left: '50%', top: '50%', joystickInput: false, inputValues: [4, 5, 6, 7] },
        { type: 'button', text: 'Start', id: 'start', location: 'right', right: 70, top: -100, fontSize: 15, block: true, input_value: 3 },
        { type: 'button', text: 'Select', id: 'select', location: 'left', left: 70, top: -100, fontSize: 15, block: true, input_value: 2 },
        { type: 'button', text: 'L', id: 'l', location: 'left', left: 3, top: -100, bold: true, block: true, input_value: 10 },
        { type: 'button', text: 'R', id: 'r', location: 'right', right: 3, top: -100, bold: true, block: true, input_value: 11 }
    ]

    const GP_STELLA = [
        { type: 'button', text: '', id: 'button_1', location: 'right', right: 40, top: 70, bold: true, input_value: 0 },
        { type: 'dpad', id: 'dpad', location: 'left', left: '50%', right: '50%', joystickInput: false, inputValues: [4, 5, 6, 7] },
        { type: 'button', text: 'Reset', id: 'reset', location: 'right', right: 5, top: -100, fontSize: 15, block: true, input_value: 3 },
        { type: 'button', text: 'Select', id: 'select', location: 'right', right: 75, top: -100, fontSize: 15, block: true, input_value: 2 }
    ]

    const GP_A5200 = [
        { type: 'zone', id: 'stick', location: 'left', left: '50%', top: '50%', joystickInput: true, inputValues: [16, 17, 18, 19] },
        { type: 'button', text: '1', id: 'button_1', location: 'right', right: 75, top: 70, bold: true, input_value: 0 },
        { type: 'button', text: '2', id: 'button_2', location: 'right', right: 5, top: 70, bold: true, input_value: 8 },
        { type: 'button', text: 'Reset', id: 'reset', location: 'right', right: 5, top: -100, fontSize: 15, block: true, input_value: 3 },
        { type: 'button', text: 'Select', id: 'select', location: 'right', right: 75, top: -100, fontSize: 15, block: true, input_value: 2 }
    ]

    const GP_PROSYSYSTEM = [
        { type: 'button', text: '1', id: 'button_1', location: 'right', right: 75, top: 70, bold: true, input_value: 0 },
        { type: 'button', text: '2', id: 'button_2', location: 'right', right: 5, top: 70, bold: true, input_value: 8 },
        { type: 'dpad', id: 'dpad', location: 'left', left: '50%', right: '50%', joystickInput: false, inputValues: [4, 5, 6, 7] },
        { type: 'button', text: 'Reset', id: 'reset', location: 'right', right: 75, top: -100, fontSize: 15, block: true, input_value: 9 },
        { type: 'button', text: 'Pause', id: 'pause', location: 'right', right: 5, top: -100, fontSize: 15, block: true, input_value: 3 },
        { type: 'button', text: 'Select', id: 'select', location: 'left', left: 5, top: -100, fontSize: 15, block: true, input_value: 2 }
    ]

    const GP_ARCADE = [
        { type: 'button', text: '1', id: 'btn1', location: 'right', right: 90, top: 100, bold: true, input_value: 1 },
        { type: 'button', text: '2', id: 'btn2', location: 'right', right: 40, top: 70, bold: true, input_value: 0 },
        { type: 'button', text: '3', id: 'btn3', location: 'right', right: -10, top: 40, bold: true, input_value: 8 },
        { type: 'button', text: '4', id: 'btn4', location: 'right', right: 90, top: 30, bold: true, input_value: 10 },
        { type: 'button', text: '5', id: 'btn5', location: 'right', right: 40, top: 0, bold: true, input_value: 9 },
        { type: 'button', text: '6', id: 'btn6', location: 'right', right: -10, top: -30, bold: true, input_value: 11 },
        { type: 'dpad', id: 'dpad', location: 'left', left: '50%', right: '50%', joystickInput: false, inputValues: [4, 5, 6, 7] },
        { type: 'button', text: 'Coin', id: 'coin', location: 'right', right: 75, top: -100, fontSize: 15, block: true, input_value: 2 },
        { type: 'button', text: 'Start', id: 'start', location: 'right', right: 5, top: -100, fontSize: 15, block: true, input_value: 3 }
    ]

    const GP_MEDNAFEN_PCE = [
        { type: 'button', text: 'II', id: 'ii', location: 'right', right: 75, top: 70, bold: true, input_value: 0 },
        { type: 'button', text: 'I', id: 'i', location: 'right', right: 5, top: 70, bold: true, input_value: 8 },
        { type: 'dpad', id: 'dpad', location: 'left', left: '50%', right: '50%', joystickInput: false, inputValues: [4, 5, 6, 7] },
        { type: 'button', text: 'Run', id: 'run', location: 'right', right: 5, top: -100, fontSize: 15, block: true, input_value: 3 },
        { type: 'button', text: 'Select', id: 'select', location: 'right', right: 75, top: -100, fontSize: 15, block: true, input_value: 2 }
    ]

    const GP_MEDNAFEN_PCFX = [
        { type: 'button', text: 'I', id: 'i', location: 'right', right: 90, top: 70, bold: true, input_value: 0 },
        { type: 'button', text: 'II', id: 'ii', location: 'right', right: 40, top: 40, bold: true, input_value: 8 },
        { type: 'button', text: 'III', id: 'iii', location: 'right', right: -10, top: 10, bold: true, input_value: 1 },
        { type: 'button', text: 'IV', id: 'iv', location: 'right', right: 90, top: 10, bold: true, input_value: 9 },
        { type: 'button', text: 'V', id: 'v', location: 'right', right: 40, top: -20, bold: true, input_value: 10 },
        { type: 'button', text: 'VI', id: 'vi', location: 'right', right: -10, top: -50, bold: true, input_value: 11 },
        { type: 'dpad', id: 'dpad', location: 'left', left: '50%', right: '50%', joystickInput: false, inputValues: [4, 5, 6, 7] },
        { type: 'button', text: 'Run', id: 'run', location: 'right', right: 5, top: -100, fontSize: 15, block: true, input_value: 3 },
        { type: 'button', text: 'Select', id: 'select', location: 'right', right: 75, top: -100, fontSize: 15, block: true, input_value: 2 }
    ]

    const VIRTUAL_GAMEPAD_MAP = {
        fceumm: GP_2BUTTON,
        nestopia: GP_2BUTTON,
        gambatte: GP_2BUTTON,
        handy: GP_2BUTTON,
        mednafen_ngp: GP_2BUTTON,
        mednafen_wswan: GP_2BUTTON,
        snes9x: GP_4BUTTON,
        melonds: GP_4BUTTON,
        desmume2015: GP_4BUTTON,
        azahar: GP_AZAHAR,
        mgba: GP_MGBA,
        beetle_vb: GP_BEETLE_VB,
        mupen64plus_next: GP_N64,
        parallel_n64: GP_N64,
        genesis_plus_gx: GP_GENESIS,
        picodrive: GP_GENESIS,
        yabause: GP_YABAUSE,
        pcsx_rearmed: GP_PSX,
        mednafen_psx_hw: GP_PSX,
        ppsspp: GP_PPSSPP,
        stella2014: GP_STELLA,
        a5200: GP_A5200,
        prosystem: GP_PROSYSYSTEM,
        fbneo: GP_ARCADE,
        mame2003_plus: GP_ARCADE,
        mednafen_pce: GP_MEDNAFEN_PCE,
        mednafen_pcfx: GP_MEDNAFEN_PCFX
    }




    // Function to search covers from IGDB
    async function openCoverSearchModal(entry) {

        const { dialogLib } = HFS



        const cleanedName = cleanFilename(entry.name)

        let searchTimeout
        let selectedCover = null
        let dialog = null  // Will be set after dialog is created

        // Create real DOM elements (not React virtual elements)
        const resultsList = document.createElement('div')
        resultsList.id = 'covers-results'
        resultsList.style.maxHeight = '400px'
        resultsList.style.overflowY = 'auto'
        resultsList.style.marginTop = '10px'
        resultsList.style.border = '1px solid #ccc'
        resultsList.style.padding = '10px'
        resultsList.style.borderRadius = '4px'
        resultsList.style.backgroundColor = '#f9f9f9'

        async function performSearch(gameName) {
            try {
                resultsList.innerHTML = '<p style="text-align:center; color: #999;">Searching...</p>'

                const response = await HFS.customRestCall('searchCovers', { romName: gameName })

                if (!response.success) {
                    resultsList.innerHTML = `<p style="color:red">Error: ${response.error}</p>`
                    return
                }

                if (response.results.length === 0) {
                    resultsList.innerHTML = ''
                    const noRes = document.createElement('p')
                    noRes.style.color = '#999'
                    noRes.style.margin = '0'
                    noRes.textContent = 'No results found '
                    const a = document.createElement('a')
                    a.textContent = 'Google Search'
                    a.href = 'https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(gameName)
                    a.target = '_blank'
                    a.style.marginLeft = '8px'
                    a.style.color = '#1976d2'
                    noRes.appendChild(a)
                    resultsList.appendChild(noRes)
                    return
                }

                resultsList.innerHTML = ''
                response.results.forEach(game => {
                    // Create item as real DOM element
                    const item = document.createElement('div')
                    item.style.padding = '10px'
                    item.style.border = '1px solid #ddd'
                    item.style.marginBottom = '5px'
                    item.style.cursor = 'pointer'
                    item.style.borderRadius = '4px'
                    item.style.backgroundColor = '#fff'
                    item.style.transition = 'all 0.2s'

                    item.addEventListener('mouseenter', () => {
                        item.style.backgroundColor = '#f0f0f0'
                        item.style.borderColor = '#999'
                    })

                    item.addEventListener('mouseleave', () => {
                        item.style.backgroundColor = '#fff'
                        item.style.borderColor = '#ddd'
                    })

                    item.addEventListener('click', async () => {
                        selectedCover = game
                        // Highlight selected
                        Array.from(resultsList.children).forEach(child => {
                            child.style.backgroundColor = '#fff'
                            child.style.borderColor = '#ddd'
                        })
                        item.style.backgroundColor = '#e3f2fd'
                        item.style.borderColor = '#1976d2'

                        // Auto-download the cover
                        try {
                            item.style.opacity = '0.6'
                            item.style.pointerEvents = 'none'

                            const result = await HFS.customRestCall('setCover', {
                                romName: entry.name,
                                gameId: selectedCover.id,
                                coverUrl: selectedCover.coverUrl,
                                romPath: entry.uri
                            })

                            if (result.success) {
                                HFS.toast('Cover downloaded successfully!', 'success')
                                dialog.close()

                            } else {
                                HFS.toast('Error: ' + result.error, 'error')
                                item.style.opacity = '1'
                                item.style.pointerEvents = 'auto'
                            }
                        } catch (err) {
                            console.error('[EmulatorJS] Cover download error:', err)
                            HFS.toast('Error downloading cover', 'error')
                            item.style.opacity = '1'
                            item.style.pointerEvents = 'auto'
                        }
                    })

                    // Create game name element
                    const nameDiv = document.createElement('div')
                    nameDiv.style.fontWeight = 'bold'
                    nameDiv.style.marginBottom = '5px'
                    nameDiv.style.fontSize = '14px'
                    nameDiv.textContent = game.name
                    item.appendChild(nameDiv)

                    // Create image element
                    const img = document.createElement('img')
                    img.src = game.coverUrl
                    img.style.maxWidth = '80px'
                    img.style.maxHeight = '120px'
                    img.style.borderRadius = '2px'
                    img.style.display = 'block'
                    img.style.marginTop = '5px'
                    img.addEventListener('error', () => {
                        img.style.display = 'none'
                    })
                    item.appendChild(img)

                    resultsList.appendChild(item)
                })
            } catch (err) {
                console.error('[EmulatorJS] Search error:', err)
                resultsList.innerHTML = '<p style="color:red">Search failed</p>'
            }
        }

        const inputElement = document.createElement('input')
        inputElement.type = 'text'
        inputElement.placeholder = 'Search game name...'
        inputElement.value = cleanedName
        inputElement.style.width = '100%'
        inputElement.style.padding = '10px'
        inputElement.style.marginBottom = '15px'
        inputElement.style.boxSizing = 'border-box'
        inputElement.style.borderRadius = '4px'
        inputElement.style.border = '1px solid #ccc'
        inputElement.style.fontSize = '14px'
        inputElement.addEventListener('input', (e) => {
            clearTimeout(searchTimeout)
            const query = e.target.value
            if (query.length > 2) {
                searchTimeout = setTimeout(() => performSearch(query), 500)
            } else {
                resultsList.innerHTML = ''
            }
        })

        // Auto-search with cleaned name if it's long enough
        if (cleanedName.length > 2) {
            setTimeout(() => performSearch(cleanedName), 300)
        }

        dialog = dialogLib.newDialog({
            title: 'Search Game Cover',
            className: 'emulatorjs-cover-modal',
            buttons: [
                {
                    text: 'Download & Set Cover',
                    onclick: async () => {
                        if (!selectedCover) {
                            HFS.toast('Please select a cover', 'warning')
                            return
                        }

                        try {
                            const result = await HFS.customRestCall('setCover', {
                                romName: entry.name,
                                gameId: selectedCover.id,
                                coverUrl: selectedCover.coverUrl,
                                romPath: entry.uri
                            })

                            if (result.success) {
                                HFS.toast('Cover downloaded successfully!', 'success')
                                dialog.close()
                            } else {
                                HFS.toast('Error: ' + result.error, 'error')
                            }
                        } catch (err) {
                            console.error('[EmulatorJS] Cover download error:', err)
                            HFS.toast('Error downloading cover', 'error')
                        }
                    }
                },
                {
                    text: 'Cancel',
                    onclick: () => {
                        dialog.close()
                    }
                }
            ]
        })

        // Find the dialog element and add content
        setTimeout(() => {
            const dialogElement = document.querySelector('[role="dialog"]')

            if (dialogElement) {
                const contentArea = dialogElement.querySelector('main') || dialogElement.querySelector('[role="presentation"]') || dialogElement.querySelector('.dialog-content')

                if (contentArea) {
                    // Create a real DOM container (not React virtual)
                    const container = document.createElement('div')
                    container.style.padding = '15px'
                    container.style.overflowY = 'auto'

                    // Add title paragraph
                    const titleP = document.createElement('p')
                    titleP.style.marginBottom = '10px'
                    titleP.style.color = '#666'
                    titleP.style.fontSize = '14px'
                    titleP.textContent = 'Type at least 3 characters to search or paste image URL:'
                    container.appendChild(titleP)

                    // Add input element
                    container.appendChild(inputElement)

                    // Add results list
                    container.appendChild(resultsList)

                    // Insert container at the beginning of contentArea (before any existing children like buttons)
                    contentArea.insertBefore(container, contentArea.firstChild)
                    inputElement.focus()
                } else {
                    console.warn('[EmulatorJS Cover Modal] contentArea not found')
                }
            } else {
                console.warn('[EmulatorJS Cover Modal] dialogElement not found after 100ms')
            }
        }, 100)
    }




    function playGameInEmulator(gameUrl, core) {

        // Ensure gameUrl is absolute (with protocol and domain)
        if (!gameUrl.startsWith('http://') && !gameUrl.startsWith('https://')) {
            // Create absolute URL using current origin
            gameUrl = window.location.origin + gameUrl
        }

        // Add ?dl at the end to force direct download in HFS
        if (!gameUrl.includes('?dl')) {
            gameUrl += '?dl'
        }

        const { dialogLib } = HFS


        // Create game container
        const gameContainer = document.createElement('div')
        gameContainer.id = 'emulator-game-container'
        gameContainer.style.width = '100%'
        gameContainer.style.height = '600px'
        gameContainer.style.minHeight = '600px'
        gameContainer.style.backgroundColor = '#000'
        gameContainer.style.position = 'relative'
        gameContainer.style.display = 'flex'
        gameContainer.style.alignItems = 'center'
        gameContainer.style.justifyContent = 'center'

        // Variable to store the loaded script for cleanup
        let emulatorScript = null




        // Create dialog with HFS dialogLib
        const dialog = dialogLib.newDialog({

            title: `EmulatorJS - ${emuVersion} - ${core} - ${decodeURIComponent(gameUrl.split('/').pop().split('?')[0])}`,
            className: 'emulatorjs-game-modal',
            closable: true,
            onClose: () => {
                window.location.reload(); // Simple way to stop and unload the emulator
            },
            buttons: [
                {
                    text: 'Close',
                    onclick: () => {
                        dialog.close()
                    }
                }
            ]
        })


        // Add content to dialog after it's rendered
        setTimeout(() => {
            const dialogElement = document.querySelector('[role="dialog"]')

            if (dialogElement) {
                // Apply modal size
                dialogElement.style.width = '75vw'
                dialogElement.style.height = '75vh'
                dialogElement.style.maxWidth = '75vw'
                dialogElement.style.maxHeight = '75vh'

                const contentArea = dialogElement.querySelector('main') || dialogElement.querySelector('[role="presentation"]') || dialogElement.querySelector('.dialog-content')

                if (contentArea) {
                    // Style content area
                    contentArea.style.display = 'flex'
                    contentArea.style.flexDirection = 'column'
                    contentArea.style.height = '100%'
                    contentArea.style.padding = '0'
                    contentArea.style.overflow = 'hidden'

                    // Insert game container
                    contentArea.insertBefore(gameContainer, contentArea.firstChild)

                    // Now load the emulator



                    setupEmulator(gameUrl, core)

                    // Load EmulatorJS loader dynamically
                    emulatorScript = document.createElement('script')
                    emulatorScript.src = window.EJS_pathtodata + 'loader.js'
                    emulatorScript.onerror = (e) => {
                        console.error('[EmulatorJS] Failed to load loader.js', e)
                        HFS.toast('Failed to load EmulatorJS loader. Check your data source setting.', 'error')
                    }
                    document.head.appendChild(emulatorScript)
                } else {
                    console.warn('[EmulatorJS] contentArea not found')
                }
            } else {
                console.warn('[EmulatorJS] dialogElement not found')
            }
        }, 100)
    }

    function setupEmulator(gameUrl, core) {
        const cleanUrl = gameUrl.split('?')[0]
        const gameName = decodeURIComponent(cleanUrl.split('/').pop())
        const romFolder = cleanUrl.slice(0, cleanUrl.lastIndexOf('/') + 1)

        window.EJS_player = '#emulator-game-container'
        window.EJS_gameUrl = gameUrl
        window.EJS_core = core
        window.EJS_gameName = gameName
        window.EJS_startOnLoaded = true
        window.EJS_fullscreenOnLoaded = true
        window.EJS_alignStartButton = 'center'
        window.EJS_threads = false
        window.EJS_fixedSaveInterval = 5000

        window.EJS_pathtodata = resolveEjsDataPath(ejsDataSource, ejsDataCustomUrl)

        if (ejsDataSource === 'local') {
            window.EJS_cacheConfig = { enabled: false }
            enforceLocalEmulatorJs()
        }

        const biosFile = BIOS_MAP[core]
        if (biosFile) {
            window.EJS_biosUrl = romFolder + biosFile + '?dl'
        } else {
            delete window.EJS_biosUrl
        }

        if (VIRTUAL_GAMEPAD_MAP[core]) {
            window.EJS_VirtualGamepadSettings = VIRTUAL_GAMEPAD_MAP[core]
        } else {
            delete window.EJS_VirtualGamepadSettings
        }

        const isFirefox = navigator.userAgent.toLowerCase().includes('firefox')
        window.EJS_defaultOptions = {
            'save-state-location': 'browser',
            'audio-latency': isFirefox ? '100' : '32'
        }

        const username = HFS.state.username || ''
        if (username.length > 0) {
            HFS.toast(`User detected: ${username}. Enabling cloud saves.`, 'success')
        }

        HFS.toast(`Starting ${core} emulator for ${gameName}`, 'info')
        debugLog('[EmulatorJS] emulator setup', { core, pathtodata: window.EJS_pathtodata, biosFile })
    }

    function toBase64(data) {
        if (!data) return ''
        if (data instanceof ArrayBuffer) {
            data = new Uint8Array(data)
        }
        if (data instanceof Uint8Array) {
            let binary = ''
            for (let i = 0; i < data.length; i++) {
                binary += String.fromCharCode(data[i])
            }
            return btoa(binary)
        }
        if (typeof data === 'string') {
            return data
        }
        throw new Error('Unsupported data type for base64 conversion: ' + typeof data)
    }

    function showCoreChooser(entry, systemInfo, cores, romUri) {
        const previous = document.getElementById('emulatorjs-core-chooser')
        if (previous) previous.remove()

        const gameName = entry.name || decodeURIComponent(String(romUri || '').split('/').pop() || '')

        const overlay = document.createElement('div')
        overlay.id = 'emulatorjs-core-chooser'
        overlay.style.position = 'fixed'
        overlay.style.inset = '0'
        overlay.style.background = 'rgba(0,0,0,.5)'
        overlay.style.display = 'flex'
        overlay.style.alignItems = 'center'
        overlay.style.justifyContent = 'center'
        overlay.style.zIndex = '100000'

        const panel = document.createElement('div')
        panel.style.background = '#1c1f23'
        panel.style.color = '#e6e8ea'
        panel.style.borderRadius = '10px'
        panel.style.padding = '1.1em 1.2em'
        panel.style.minWidth = '260px'
        panel.style.maxWidth = '90vw'
        panel.style.boxShadow = '0 10px 30px rgba(0,0,0,.6)'
        panel.style.font = '15px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif'

        const heading = document.createElement('div')
        heading.textContent = `Play ${gameName} (${systemInfo.name || systemInfo.system})`
        heading.style.fontWeight = '600'
        heading.style.marginBottom = '.7em'
        panel.appendChild(heading)

        function close() {
            document.removeEventListener('keydown', onKey)
            overlay.remove()
        }
        function onKey(e) {
            if (e.key === 'Escape') close()
        }
        document.addEventListener('keydown', onKey)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close()
        })

        cores.forEach((coreId) => {
            const btn = document.createElement('button')
            btn.type = 'button'
            btn.textContent = coreId
            btn.style.display = 'block'
            btn.style.width = '100%'
            btn.style.textAlign = 'left'
            btn.style.margin = '0 0 .4em'
            btn.style.padding = '.5em .7em'
            btn.style.borderRadius = '6px'
            btn.style.border = '1px solid #2c3036'
            btn.style.background = '#121417'
            btn.style.color = 'inherit'
            btn.style.cursor = 'pointer'
            btn.style.font = 'inherit'
            btn.addEventListener('mouseenter', () => { btn.style.borderColor = '#4d9bf0' })
            btn.addEventListener('mouseleave', () => { btn.style.borderColor = '#2c3036' })
            btn.addEventListener('click', () => {
                close()
                playGameInEmulator(romUri, coreId)
            })
            panel.appendChild(btn)
        })

        const cancel = document.createElement('button')
        cancel.type = 'button'
        cancel.textContent = 'Cancel'
        cancel.style.marginTop = '.5em'
        cancel.style.padding = '.4em .8em'
        cancel.style.borderRadius = '6px'
        cancel.style.border = '1px solid #2c3036'
        cancel.style.background = 'transparent'
        cancel.style.color = 'inherit'
        cancel.style.cursor = 'pointer'
        cancel.style.font = 'inherit'
        cancel.addEventListener('click', close)
        panel.appendChild(cancel)

        overlay.appendChild(panel)
        document.body.appendChild(overlay)

        const first = panel.querySelector('button')
        if (first) first.focus()
    }

    // Function to display game information modal
    async function openGameInfoModal(entry) {

        const { dialogLib } = HFS


        const cleanedName = cleanFilename(entry.name)

        let selectedGame = null
        let dialog = null

        const gamesList = document.createElement('div')
        gamesList.id = 'game-info-list'
        gamesList.style.maxHeight = '500px'
        gamesList.style.overflowY = 'auto'
        gamesList.style.marginTop = '10px'
        gamesList.style.border = '1px solid #ccc'
        gamesList.style.padding = '10px'
        gamesList.style.borderRadius = '4px'
        gamesList.style.backgroundColor = '#f9f9f9'

        async function performSearch(gameName) {
            try {
                gamesList.innerHTML = '<p style="text-align:center; color: #999;">Searching...</p>'

                const response = await HFS.customRestCall('searchGameInfo', { gameName: gameName })

                if (!response.success) {
                    gamesList.innerHTML = `<p style="color:red">Error: ${response.error}</p>`
                    return
                }

                if (response.results.length === 0) {
                    gamesList.innerHTML = ''
                    const noRes = document.createElement('p')
                    noRes.style.color = '#999'
                    noRes.style.margin = '0'
                    noRes.textContent = 'No results found '
                    const a = document.createElement('a')
                    a.textContent = 'Google Search'
                    a.href = 'https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(gameName)
                    a.target = '_blank'
                    a.style.marginLeft = '8px'
                    a.style.color = '#1976d2'
                    noRes.appendChild(a)
                    gamesList.appendChild(noRes)
                    return
                }

                gamesList.innerHTML = ''
                let games = response.results;

                // order games by platform containsing the system of the rom, then alphabetically
                const romSystems = getSystemsForFile(entry.name).map(s => s.system.toLowerCase())
                games.sort((a, b) => {
                    const aPlatforms = Array.isArray(a.platforms) ? a.platforms : (typeof a.platforms === 'string' ? a.platforms.split(',').map(s => s.trim()) : [])
                    const bPlatforms = Array.isArray(b.platforms) ? b.platforms : (typeof b.platforms === 'string' ? b.platforms.split(',').map(s => s.trim()) : [])
                    const aPlatformMatch = aPlatforms.some(p => romSystems.includes(String(p).toLowerCase()))
                    const bPlatformMatch = bPlatforms.some(p => romSystems.includes(String(p).toLowerCase()))
                    if (aPlatformMatch && !bPlatformMatch) return -1
                    if (!aPlatformMatch && bPlatformMatch) return 1
                    return a.name.localeCompare(b.name)
                });

                games.forEach(game => {
                    const item = document.createElement('div')
                    item.style.padding = '12px'
                    item.style.border = '1px solid #ddd'
                    item.style.marginBottom = '8px'
                    item.style.cursor = 'pointer'
                    item.style.borderRadius = '4px'
                    item.style.backgroundColor = '#fff'
                    item.style.transition = 'all 0.2s'

                    item.addEventListener('mouseenter', () => {
                        item.style.backgroundColor = '#f0f0f0'
                        item.style.borderColor = '#999'
                    })

                    item.addEventListener('mouseleave', () => {
                        if (selectedGame?.id !== game.id) {
                            item.style.backgroundColor = '#fff'
                            item.style.borderColor = '#ddd'
                        }
                    })

                    item.addEventListener('click', () => {
                        selectedGame = game
                        Array.from(gamesList.children).forEach(child => {
                            child.style.backgroundColor = '#fff'
                            child.style.borderColor = '#ddd'
                        })
                        item.style.backgroundColor = '#e3f2fd'
                        item.style.borderColor = '#1976d2'

                        // Auto-save the game info
                        HFS.customRestCall('saveGameInfo', {
                            romName: entry.name,
                            gameInfo: game
                        }).then(async result => {
                            if (result.success) {
                                HFS.toast('Game info saved!', 'success')

                                // Download cover if it doesn't exist
                                if (game.coverUrl) {
                                    try {
                                        const setCoverResult = await HFS.customRestCall('setCover', {
                                            romName: entry.name,
                                            gameId: game.id,
                                            coverUrl: game.coverUrl,
                                            romPath: entry.uri,
                                            overwrite: false
                                        })

                                        if (setCoverResult.success) {
                                            HFS.toast('Cover downloaded successfully!', 'success')
                                        } else {
                                        }
                                    } catch (err) {
                                        console.error('[EmulatorJS Game Info] Error downloading cover:', err)
                                    }
                                }

                                setTimeout(() => {
                                    dialog.close()
                                }, 1000)
                            } else {
                                HFS.toast('Error saving game info', 'error')
                            }
                        }).catch(err => {
                            console.error('[EmulatorJS] Save error:', err)
                            HFS.toast('Error saving game info', 'error')
                        })
                    })

                    // Game name
                    const nameDiv = document.createElement('div')
                    nameDiv.style.fontWeight = 'bold'
                    nameDiv.style.marginBottom = '8px'
                    nameDiv.style.fontSize = '16px'
                    nameDiv.style.color = '#222'
                    nameDiv.textContent = game.name
                    item.appendChild(nameDiv)

                    // Rating
                    if (game.rating || game.aggregatedRating) {
                        const ratingDiv = document.createElement('div')
                        ratingDiv.style.fontSize = '12px'
                        ratingDiv.style.marginBottom = '4px'
                        ratingDiv.style.color = '#666'
                        const userRating = game.rating ? game.rating.toFixed(1) : 'N/A'
                        const criticRating = game.aggregatedRating ? game.aggregatedRating.toFixed(1) : 'N/A'
                        ratingDiv.innerHTML = `<strong>Ratings:</strong> User: ${userRating}/100 | Critics: ${criticRating}/100`
                        item.appendChild(ratingDiv)
                    }

                    // Summary
                    if (game.summary) {
                        const summaryDiv = document.createElement('div')
                        summaryDiv.style.fontSize = '12px'
                        summaryDiv.style.marginBottom = '6px'
                        summaryDiv.style.color = '#555'
                        summaryDiv.style.lineHeight = '1.4'
                        summaryDiv.style.maxHeight = '60px'
                        summaryDiv.style.overflow = 'hidden'
                        summaryDiv.textContent = game.summary
                        item.appendChild(summaryDiv)
                    }

                    // Create info grid
                    const infoGrid = document.createElement('div')
                    infoGrid.style.fontSize = '11px'
                    infoGrid.style.color = '#666'
                    infoGrid.style.marginTop = '8px'
                    infoGrid.style.display = 'grid'
                    infoGrid.style.gridTemplateColumns = '1fr 1fr'
                    infoGrid.style.gap = '4px'

                    const infoItems = [
                        ['Genres', game.genres],
                        ['Platforms', game.platforms],
                        ['Game Modes', game.gameModes],
                        ['Themes', game.themes],
                        ['Developers', game.developers],
                        ['Publishers', game.publishers],
                        ['Engines', game.gameEngines],
                        ['Languages', game.languages],
                        ['Perspectives', game.playerPerspectives]
                    ]

                    infoItems.forEach(([label, value]) => {
                        if (value && value !== 'N/A') {
                            const infoItem = document.createElement('div')
                            infoItem.style.padding = '4px 0'
                            infoItem.innerHTML = `<strong>${label}:</strong> ${value}`
                            infoItem.style.wordBreak = 'break-word'
                            infoGrid.appendChild(infoItem)
                        }
                    })

                    if (infoGrid.children.length > 0) {
                        item.appendChild(infoGrid)
                    }

                    // Cover image
                    if (game.coverUrl) {
                        const imgDiv = document.createElement('div')
                        imgDiv.style.marginTop = '8px'
                        imgDiv.style.textAlign = 'center'
                        const img = document.createElement('img')
                        img.src = game.coverUrl
                        img.style.maxWidth = '100%'
                        img.style.maxHeight = '150px'
                        img.style.borderRadius = '2px'
                        img.addEventListener('error', () => {
                            img.style.display = 'none'
                        })
                        imgDiv.appendChild(img)
                        item.appendChild(imgDiv)
                    }

                    gamesList.appendChild(item)
                })
            } catch (err) {
                console.error('[EmulatorJS] Search error:', err)
                gamesList.innerHTML = '<p style="color:red">Search failed</p>'
            }
        }

        const inputElement = document.createElement('input')
        inputElement.type = 'text'
        inputElement.placeholder = 'Search game name...'
        inputElement.value = cleanedName
        inputElement.style.width = '100%'
        inputElement.style.padding = '10px'
        inputElement.style.marginBottom = '15px'
        inputElement.style.boxSizing = 'border-box'
        inputElement.style.borderRadius = '4px'
        inputElement.style.border = '1px solid #ccc'
        inputElement.style.fontSize = '14px'

        let searchTimeout
        inputElement.addEventListener('input', (e) => {
            clearTimeout(searchTimeout)
            const query = e.target.value
            if (query.length > 2) {
                searchTimeout = setTimeout(() => performSearch(query), 500)
            } else {
                gamesList.innerHTML = ''
            }
        })

        // Auto-search with cleaned name
        if (cleanedName.length > 2) {
            setTimeout(() => performSearch(cleanedName), 300)
        }

        dialog = dialogLib.newDialog({
            title: 'Game Information',
            className: 'emulatorjs-game-info-modal',
            buttons: [
                {
                    text: 'Close',
                    onclick: () => {
                        dialog.close()
                    }
                }
            ]
        })


        // Find the dialog element and add content
        setTimeout(() => {
            const dialogElement = document.querySelector('[role="dialog"]')

            if (dialogElement) {
                const contentArea = dialogElement.querySelector('main') || dialogElement.querySelector('[role="presentation"]') || dialogElement.querySelector('.dialog-content')

                if (contentArea) {
                    const container = document.createElement('div')
                    container.style.padding = '15px'
                    container.style.overflowY = 'auto'
                    container.style.maxHeight = '600px'

                    const titleP = document.createElement('p')
                    titleP.style.marginBottom = '10px'
                    titleP.style.color = '#666'
                    titleP.style.fontSize = '14px'
                    titleP.textContent = 'Search and view detailed game information from IGDB:'
                    container.appendChild(titleP)

                    container.appendChild(inputElement)
                    container.appendChild(gamesList)

                    contentArea.insertBefore(container, contentArea.firstChild)
                    inputElement.focus()
                } else {
                    console.warn('[EmulatorJS Game Info] contentArea not found')
                }
            } else {
                console.warn('[EmulatorJS Game Info] dialogElement not found')
            }
        }, 100)
    }



    HFS.onEvent('fileMenu', ({ entry, menu, props }) => {


        const filename = entry.name
        // Prefer entry.ext when available
        const ext = (entry && entry.ext) ? entry.ext.toLowerCase() : (filename.includes('.') ? filename.split('.').pop().toLowerCase() : '')
        const allSystems = getSystemsForFile(ext || filename)



        // Debug: logs when fileMenu is called



        if (!allSystems || allSystems.length === 0 || entry.isFolder) return



        try {

            // Try to get cached game info
            HFS.customRestCall('getGameInfo', { romName: filename })
                .then(result => {
                    if (result.success && result.gameInfo) {
                        const game = result.gameInfo

                        // Add properties in a specific order
                        const propsToAdd = []

                        if (game.name) {
                            propsToAdd.push({ id: 'game-name', label: 'Game Title', value: game.name })
                        }

                        if (game.rating) {
                            propsToAdd.push({ id: 'game-rating', label: 'User Rating', value: Math.round(game.rating) + '/100' })
                        }

                        if (game.aggregatedRating) {
                            propsToAdd.push({ id: 'game-critic-rating', label: 'Critic Rating', value: Math.round(game.aggregatedRating) + '/100' })
                        }

                        if (game.genres && game.genres !== 'N/A') {
                            propsToAdd.push({ id: 'game-genres', label: 'Genres', value: game.genres })
                        }

                        if (game.platforms && game.platforms !== 'N/A') {
                            propsToAdd.push({ id: 'game-platforms', label: 'Platforms', value: game.platforms })
                        }

                        if (game.developers && game.developers !== 'N/A') {
                            propsToAdd.push({ id: 'game-developers', label: 'Developers', value: game.developers })
                        }

                        if (game.publishers && game.publishers !== 'N/A') {
                            propsToAdd.push({ id: 'game-publishers', label: 'Publishers', value: game.publishers })
                        }

                        if (game.gameModes && game.gameModes !== 'N/A') {
                            propsToAdd.push({ id: 'game-modes', label: 'Game Modes', value: game.gameModes })
                        }

                        if (game.themes && game.themes !== 'N/A') {
                            propsToAdd.push({ id: 'game-themes', label: 'Themes', value: game.themes })
                        }

                        if (game.playerPerspectives && game.playerPerspectives !== 'N/A') {
                            propsToAdd.push({ id: 'game-perspectives', label: 'Perspectives', value: game.playerPerspectives })
                        }

                        if (game.gameEngines && game.gameEngines !== 'N/A') {
                            propsToAdd.push({ id: 'game-engines', label: 'Game Engines', value: game.gameEngines })
                        }

                        if (game.languages && game.languages !== 'N/A') {
                            propsToAdd.push({ id: 'game-languages', label: 'Languages', value: game.languages })
                        }

                        if (game.releaseDates && game.releaseDates.length > 0) {
                            propsToAdd.push({ id: 'game-release', label: 'Release Dates', value: game.releaseDates.join(', ') })
                        }

                        if (game.ageRatings && game.ageRatings !== 'N/A') {
                            propsToAdd.push({ id: 'game-ratings', label: 'Age Ratings', value: game.ageRatings })
                        }

                        if (game.alternativeNames && game.alternativeNames !== 'N/A') {
                            propsToAdd.push({ id: 'game-alt-names', label: 'Alternative Names', value: game.alternativeNames })
                        }

                        // Add all properties to the props array
                        if (Array.isArray(props)) {
                            propsToAdd.forEach(prop => props.push(prop))
                        } else {
                            console.warn('[EmulatorJS] fileMenu props not available; skipping game properties')
                        }
                    }
                })
                .catch(err => {
                    console.error('[EmulatorJS] Error loading game info for menu:', err)
                })
        } catch (err) {
            console.error('[EmulatorJS] error in fileMenu props handler', err)
        }

        try {

            menu.unshift({ id: 'separator-emulatorjs-1', type: 'separator' })



            const entryPath = entry.uri || entry.url;
            const srcCover = entryPath + '?get=game_cover&t=' + Date.now();


            // Add 'View Cover' option 
            const viewCoverItem = {
                id: 'view-cover',
                label: 'View Cover',
                subLabel: 'Preview cover image',
                icon: srcCover,

                onClick: async () => {

                    try {

                        const { dialogLib } = HFS

                        // Create modal to show image
                        let dialog = dialogLib.newDialog({
                            title: 'Cover Preview',
                            className: 'emulatorjs-view-cover-modal',
                            buttons: [
                                {
                                    text: 'Close',
                                    onclick: () => { dialog.close() }
                                }
                            ]
                        })

                        // Insert image into dialog once it's rendered
                        setTimeout(() => {
                            const dialogElement = document.querySelector('[role="dialog"]')
                            if (!dialogElement) return
                            const contentArea = dialogElement.querySelector('main') || dialogElement.querySelector('[role="presentation"]') || dialogElement.querySelector('.dialog-content')
                            if (!contentArea) return

                            // Clear and insert image
                            const container = document.createElement('div')
                            container.style.textAlign = 'center'
                            container.style.padding = '10px'

                            const img = document.createElement('img')
                            img.src = srcCover
                            img.style.maxWidth = '100%'
                            img.style.maxHeight = '70vh'
                            img.style.borderRadius = '4px'
                            img.alt = entry.name
                            img.onerror = () => {
                                dialog.close();
                                HFS.toast('Error loading cover image', 'error')
                            }

                            container.appendChild(img)
                            contentArea.insertBefore(container, contentArea.firstChild)
                        }, 100)

                        return true
                    } catch (err) {
                        console.error('[EmulatorJS] Error viewing cover:', err)
                        HFS.toast('Error loading cover', 'error')
                        return false
                    }
                }
            }

            // Add 'Game Info' option (only for admins)
            // Check if user has admin access via adminUrl property
            const isAdmin = Boolean(HFS.state.adminUrl)

            if (isAdmin) {
                const gameInfoItem = {
                    id: 'game-info',
                    label: 'Game Info',
                    subLabel: 'View IGDB details',
                    icon: 'info',
                    onClick: async () => {
                        await openGameInfoModal(entry)
                        return true
                    }
                }

                // Add 'Set Cover' option (only for admins)
                const coverItem = {
                    id: 'set-cover',
                    label: 'Set Cover',
                    subLabel: 'Search IGDB',
                    icon: 'image',
                    onClick: async () => {
                        await openCoverSearchModal(entry)
                        return true
                    }
                }



                // Add 'Remove Cover' option (only for admins)
                const removeCoverItem = {
                    id: 'remove-cover',
                    label: 'Remove Cover',
                    subLabel: 'Delete cover image',
                    icon: 'delete',
                    onClick: async () => {

                        // Ask for confirmation
                        if (!confirm(`Remove cover for "${entry.name}"?`)) {
                            return false
                        }

                        try {
                            const result = await HFS.customRestCall('removeCover', { romName: entry.name })

                            if (result.success) {
                                HFS.toast('Cover removed successfully!', 'success')
                                // Refresh the page to update the display
                                location.reload()
                            } else {
                                HFS.toast(result.error || 'Failed to remove cover', 'error')
                            }
                        } catch (err) {
                            console.error('[EmulatorJS] Error removing cover:', err)
                            HFS.toast('Error removing cover', 'error')
                        }

                        return true
                    }
                }

                // Insert admin options at the top (order: Game Info, Set Cover, View Cover, Remove Cover)

                menu.unshift(removeCoverItem)
                menu.unshift(coverItem)
                menu.unshift(gameInfoItem)
            }

            // Finally add View Cover option
            menu.unshift(viewCoverItem)

            // Create a Play button for each compatible core for the detected systems
            allSystems.forEach((systemInfo, sysIndex) => {
                const cores = (Array.isArray(systemInfo.core) && systemInfo.core.length) ? systemInfo.core : []
                if (cores.length === 0) return

                const romUri = entry.uri || entry.url || entry.path || entry.name
                const platIcon = detectBestIcon(systemInfo.system, iconTheme)
                const icon = platIcon ? `${pluginPublic}${platIcon.path}` : '🕹️'

                menu.unshift({ id: `separator-emulatorjs-play-${sysIndex}`, type: 'separator' })

                if (cores.length === 1) {
                    menu.unshift({
                        id: `play-${systemInfo.system}-${cores[0]}`,
                        label: 'Play',
                        subLabel: `${systemInfo.name} · ${cores[0]}`,
                        icon,
                        onClick: () => {
                            playGameInEmulator(romUri, cores[0])
                            return true
                        }
                    })
                } else {
                    menu.unshift({
                        id: `play-${systemInfo.system}`,
                        label: 'Play',
                        subLabel: `${systemInfo.name} · choose core`,
                        icon,
                        onClick: () => {
                            showCoreChooser(entry, systemInfo, cores, romUri)
                            return true
                        }
                    })
                }
            })

        } catch (err) {
            console.error('[EmulatorJS] error in fileMenu handler', err)
        }
    })





    // Função para detectar quais consoles estão presentes na pasta
    async function detectFolderConsoles(folderUri) {
        try {

            const detectedConsoles = new Set()

            activePossiblePlatforms(folderUri).forEach(systemInfo => {

                detectedConsoles.add(systemInfo.name)
            })

            const response = await fetch(folderUri + '?get=list&folders=0')
            if (response.ok) {

                const text = await response.text()

                const lines = text.split('\n')
                for (const line of lines) {
                    const filename = line.trim()
                    if (!filename) continue

                    getSystemsForFile(filename).forEach(systemInfo => {
                        detectedConsoles.add(systemInfo.name)
                    })
                }
            }



            const consoles = Array.from(detectedConsoles)
            return consoles
        } catch (err) {
            console.error('[EmulatorJS] Error detecting consoles:', err)
            return []
        }
    }

    // Função para abrir modal de seleção de ícone
    async function openIconSelectionModal(folderEntry) {
        try {

            const { dialogLib } = HFS


            let icons = getAllIcons(iconTheme, false); // ommit content icons


            if (icons.length === 0) {
                HFS.toast('No console icons available', 'error')
                return
            }

            // Detectar consoles na pasta
            const detectedConsoles = await detectFolderConsoles(folderEntry.uri || folderEntry.url) || []
            detectedConsoles.sort()
            let initialSearchValue = ''

            initialSearchValue = detectedConsoles.join("/") + '/' + folderEntry.name


            let dialog = null
            let searchInput = null

            // Criar container para busca e ícones
            const mainContainer = document.createElement('div')
            mainContainer.style.display = 'flex'
            mainContainer.style.flexDirection = 'column'
            mainContainer.style.height = '100%'

            // Criar barra de busca
            const searchContainer = document.createElement('div')
            searchContainer.style.padding = '15px'
            searchContainer.style.borderBottom = '1px solid #ddd'

            searchInput = document.createElement('input')
            searchInput.type = 'text'
            searchInput.placeholder = 'Search console...'
            searchInput.value = initialSearchValue
            searchInput.style.width = '100%'
            searchInput.style.padding = '10px'
            searchInput.style.fontSize = '14px'
            searchInput.style.border = '1px solid #ccc'
            searchInput.style.borderRadius = '4px'
            searchInput.style.boxSizing = 'border-box'

            searchContainer.appendChild(searchInput)

            // Criar container para os ícones
            const iconsContainer = document.createElement('div')
            iconsContainer.style.display = 'grid'
            iconsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(100px, 1fr))'
            iconsContainer.style.gap = '15px'
            iconsContainer.style.padding = '20px'
            iconsContainer.style.maxHeight = '400px'
            iconsContainer.style.overflowY = 'auto'
            iconsContainer.style.flex = '1'

            // Função para filtrar e exibir ícones
            function updateIconsDisplay(searchTerm) {
                iconsContainer.innerHTML = ''
                const searchLower = searchTerm.toLowerCase()

                icons.forEach(icon => {
                    // Filtrar por termo de busca, levando em conta varios consoles separados por /
                    const searchTerms = searchLower.split("/").map(term => term.trim()).filter(term => term.length > 0)
                    if (!searchTerms.some(term => icon.name.toLowerCase().includes(term) || icon.platform.toLowerCase().includes(term) || icon.system.toLowerCase().includes(term) || icon.manufacturer.toLowerCase().includes(term))) {
                        return
                    }

                    const iconDiv = document.createElement('div')
                    iconDiv.style.display = 'flex'
                    iconDiv.style.flexDirection = 'column'
                    iconDiv.style.alignItems = 'center'
                    iconDiv.style.cursor = 'pointer'
                    iconDiv.style.padding = '10px'
                    iconDiv.style.borderRadius = '8px'
                    iconDiv.style.border = '2px solid transparent'
                    iconDiv.style.transition = 'all 0.2s'

                    const img = document.createElement('img')
                    img.src = `${pluginPublic}${icon.path}`
                    img.alt = icon.name
                    img.style.width = '64px'
                    img.style.height = '64px'
                    img.style.objectFit = 'contain'
                    img.style.marginBottom = '8px'

                    const label = document.createElement('div')
                    label.textContent = icon.platform
                    label.style.fontSize = '11px'
                    label.style.textAlign = 'center'
                    label.style.wordWrap = 'break-word'
                    label.style.maxWidth = '100px'

                    const subLabel = document.createElement('div')
                    subLabel.textContent = icon.manufacturer
                    subLabel.style.fontSize = '9px'
                    subLabel.style.textAlign = 'center'
                    subLabel.style.wordWrap = 'break-word'
                    subLabel.style.maxWidth = '100px'

                    iconDiv.appendChild(img)
                    iconDiv.appendChild(label)
                    iconDiv.appendChild(subLabel)

                    iconDiv.addEventListener('click', async () => {
                        try {

                            const setResult = await HFS.customRestCall('setFolderIcon', {
                                folderPath: folderEntry.uri || folderEntry.url,
                                iconName: icon.name
                            })

                            if (setResult.success) {
                                HFS.toast('Console icon set successfully!', 'success')
                                dialog.close()
                            } else {
                                HFS.toast('Failed to set icon: ' + (setResult.error || 'Unknown error'), 'error')
                            }
                        } catch (err) {
                            console.error('[EmulatorJS] Error setting folder icon:', err)
                            HFS.toast('Error setting icon', 'error')
                        }
                    })

                    iconDiv.addEventListener('mouseover', () => {
                        iconDiv.style.borderColor = '#2196F3'
                        iconDiv.style.backgroundColor = 'rgba(33, 150, 243, 0.1)'
                    })

                    iconDiv.addEventListener('mouseout', () => {
                        iconDiv.style.borderColor = 'transparent'
                        iconDiv.style.backgroundColor = 'transparent'
                    })

                    iconsContainer.appendChild(iconDiv)
                })

                // Se não houver resultados
                if (iconsContainer.children.length === 0) {
                    const noResults = document.createElement('div')
                    noResults.style.gridColumn = '1 / -1'
                    noResults.style.textAlign = 'center'
                    noResults.style.padding = '20px'
                    noResults.style.color = '#999'
                    noResults.textContent = 'No console icons found'
                    iconsContainer.appendChild(noResults)
                }
            }

            // Listener para busca em tempo real
            searchInput.addEventListener('input', (e) => {
                updateIconsDisplay(e.target.value)
            })

            // Mostrar ícones iniciais
            updateIconsDisplay(initialSearchValue)

            mainContainer.appendChild(searchContainer)
            mainContainer.appendChild(iconsContainer)

            // Criar diálogo
            dialog = dialogLib.newDialog({
                title: 'Select Console Icon',
                className: 'emulatorjs-icon-modal',
                buttons: [
                    {
                        text: 'Cancel',
                        onclick: () => {
                            dialog.close()
                        }
                    }
                ]
            })

            // Adicionar conteúdo ao diálogo
            setTimeout(() => {
                const dialogElement = document.querySelector('[role="dialog"]')
                if (dialogElement) {
                    const contentArea = dialogElement.querySelector('main') || dialogElement.querySelector('[role="presentation"]') || dialogElement.querySelector('.dialog-content')
                    if (contentArea) {
                        contentArea.appendChild(mainContainer)
                        // Dar foco ao input de busca
                        searchInput.focus()
                    }
                }
            }, 100)
        } catch (err) {
            console.error('[EmulatorJS] Error in icon selection modal:', err)
            HFS.toast('Error opening icon selection', 'error')
        }
    }

    HFS.onEvent('fileMenu', async ({ entry, menu }) => {
        try {
            // Verificar se é uma pasta
            if (!entry.isFolder) return

            // Verificar se a pasta tem arquivos compatíveis
            const hasRoms = await detectFolderConsoles(entry.uri || entry.url)
            if (!hasRoms) return

            // Verificar se o usuário é admin
            const isAdmin = Boolean(HFS.state.adminUrl)
            if (!isAdmin) return


            // Adicionar item de menu para definir ícone
            const iconItem = {
                id: 'set-console-icon',
                label: 'Set Console Icon',
                subLabel: 'Choose an icon for this folder',
                icon: 'image',
                onClick: async () => {
                    await openIconSelectionModal(entry)
                    return true
                }
            }

            menu.unshift(iconItem)

            // Verificar se a pasta já tem um ícone customizado
            const folderPath = entry.uri || entry.url
            // Adicionar item de menu para remover ícone
            const removeIconItem = {
                id: 'remove-console-icon',
                label: 'Remove Console Icon',
                subLabel: 'Remove the custom icon from this folder',
                icon: 'trash',
                onClick: async () => {
                    try {
                        const result = await HFS.customRestCall('removeFolderIcon', {
                            folderPath: folderPath
                        })

                        if (result.success) {
                            HFS.toast('Console icon removed successfully!', 'success')
                        } else {
                            HFS.toast('Error removing icon: ' + (result.error || 'Unknown error'), 'error')
                        }
                    } catch (err) {
                        console.error('[EmulatorJS] Error removing folder icon:', err)
                        HFS.toast('Error removing icon', 'error')
                    }
                    return true
                }
            }

            menu.unshift(removeIconItem)
        } catch (err) {
            console.error('[EmulatorJS] error in fileMenu handler for folders', err)
        }
    })


    // Hook para aplicar ícone customizado às pastas
    HFS.onEvent('entryIcon', async ({ entry }) => {

        function ImgFallback({ fallback, tag = 'img', props }) {
            const [err, setErr] = HFS.React.useState()
            return err ? fallback && HFS.h(fallback) : HFS.h(tag, Object.assign(props, {
                onError() { setErr(true) }
            }))
        }

        const entryPath = entry.uri || entry.url;
        const srcCover = entryPath + `?get=game_cover&t=` + Date.now();

        if (entry.isFolder || (entry.isFolder == false && activeExtensions.has(entry.ext))) {
            return HFS.h(ImgFallback, {
                // No cover -> render nothing. HFS renders every entryIcon
                // output, so a default-icon fallback here would duplicate the
                // folder icon (and another plugin may already provide one).
                fallback: null,
                props: {
                    src: srcCover,
                    className: 'icon thumbnail'
                }

            })
        } else {
            // HFS renders the default icon when no output is returned;
            // an explicit null would blank the whole icon slot instead.
            return
        }
    })


}

