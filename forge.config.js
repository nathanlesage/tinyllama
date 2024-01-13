module.exports = {
  hooks: {},
  rebuildConfig: {
    // Since we must build native modules for both x64 as well as arm64, we have
    // to explicitly build it everytime for the correct architecture
    force: true // NOTE: By now covered by the global flag on packaging.
  },
  packagerConfig: {
    appBundleId: 'com.zettlr.local-chat',
    asar: {
      // We must add native node modules to this option. Doing so ensures that
      // the modules will be code-signed. (They still end up in the final
      // app.asar file, but they will be code-signed.) Code signing these dylibs
      // is required on macOS for the Node process to properly load them.
      unpack: '*.{node,dll}'
    },
    darwinDarkModeSupport: 'true',
    // Electron-forge automatically adds the file extension based on OS
    // TODO icon: 'path/to/icon-folder',
    name: 'LocalChat',
    // The certificate is written to the default keychain during CI build.
    // See ./scripts/add-osx-cert.sh
    // osxSign: {
    //   identity: 'Developer ID Application: Hendrik Erz (QS52BN8W68)',
    //   'hardened-runtime': true,
    //   'gatekeeper-assess': false,
    //   entitlements: 'scripts/assets/entitlements.plist',
    //   'entitlements-inherit': 'scripts/assets/entitlements.plist',
    //   'signature-flags': 'library'
    // },
    // Since electron-notarize 1.1.0 it will throw instead of simply print a
    // warning to the console, so we have to actively check if we should
    // notarize or not. We do so by checking for the necessary environment
    // variables and set the osxNotarize option to false otherwise to prevent
    // notarization.
    osxNotarize: ('APPLE_ID' in process.env && 'APPLE_ID_PASS' in process.env)
      ? {
          tool: 'notarytool',
          appleId: process.env.APPLE_ID,
          appleIdPassword: process.env.APPLE_ID_PASS,
          teamId: 'QS52BN8W68'
        }
      : false,
    extraResource: [
      'resources/icons/icon.code.icns'
    ]
  },
  plugins: [
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: './webpack.main.config.js',
        devContentSecurityPolicy: "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        port: 3000,
        loggerPort: 9001,
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './src/main-window/index.htm',
              js: './src/main-window/index.ts',
              name: 'main_window',
              preload: {
                js: './src/main-window/preload.ts'
              }
            }
          ]
        }
      }
    }
  ],
  makers: [] // TODO
}