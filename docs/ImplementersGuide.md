# Implementers’ Guide

## Introduction

### Welcome to Thorium Web

Thorium Web is a highly customizable web application for reading publications such as EPUB online – and soon audiobooks and comics. Built on top of Next.js, a popular open-source React-based framework, Thorium Web provides a flexible and adaptable platform for reading and navigating digital publications.

This Implementers' Guide is designed to help developers integrate Thorium Web into their existing infrastructure. Whether you're building a new reading platform or enhancing an existing one, this guide will walk you through the technical details of implementing Thorium Web, from setting up the development environment to deploying the application.

### Who is this guide for?

This guide is intended for developers who want to integrate Thorium Web into their existing infrastructure. It assumes a basic understanding of web development and programming concepts, including JavaScript, React, and Next.js.

### What will you learn?

In this guide, you'll learn how to:

- Set up the development environment for Thorium Web
- Understand the project architecture and key components
- Implement Thorium Web in your existing infrastructure
- Customize the application to meet your needs
- Troubleshoot common issues and optimize performance

By the end of this guide, you'll have a solid understanding of how to implement Thorium Web and start building your own reading platform.

## Overview of the Project Architecture

Thorium Web uses [Next.js](https://nextjs.org/), a popular open-source React-based framework for building server-side rendered (SSR) and statically generated websites and applications. It is written in TypeScript.

- **Deployment:** Thorium Web is deployed on Cloudflare Pages. The repository is simply linked and works out of the box. Alternative deployment options include Vercel.
- **Components:** Thorium Web UI is built using React Aria for its components. 
- **Navigator:** Thorium Web implements navigators that are responsible for displaying and navigating publications. These navigators are client-only and part of [Readium TS-Toolkit](https://github.com/readium/ts-toolkit). Styling of EPUB publications is done through [Readium CSS](https://github.com/readium/readium-css).
- **Publication Manifest:** Thorium Web relies on the [Readium Web Publication Manifest](https://readium.org/webpub-manifest/). The Readium Web Publication Manifest is a JSON-based document meant to represent and distribute publications over HTTPS. It is the primary exchange format used in the [Readium Architecture](https://readium.org/architecture/).
- **PositionsList:** The [positions list](https://readium.org/architecture/models/locators/positions/) is required by the Readium TS-Toolkit Navigator to operate.
- **Publication Parsing:** Publications are parsed using the [Readium Go-Toolkit](https://github.com/readium/go-toolkit) – it creates this Readium Web Publication Manifest and Positions List for instance.
- **Publication Storage:** Publications are stored on Google Cloud.

In addition, [Redux](https://redux.js.org/) is used to manage global states.

Here's a high-level system diagram showing the relationships between the components and technologies:

```
+---------------+
|  Cloudflare   |
|  Pages (CDN)  |
+---------------+
       |
       |
       v
+-----------+
|  Next.js  |
+-----------+
      |
      |
      v
+-------------------+
| Reader            |
| +---------------+ |
| |  App UI       | |
| |  (React Aria) | |
| +---------------+ |
| +---------------+ |
| |  Navigators   | |
| |  (Readium     | |
| |  TS-Toolkit,  | |
| |  Readium CSS) | |
| +---------------+ |
+-------------------+
       |
       |
       v
+---------------+
|  Readium      |
|  Positions    |
|  List         |
+---------------+
       |
       |
       v
+---------------+
|  Readium Web  |
|  Publication  |
|  Manifest     |
+---------------+
       |
       |
       v
+--------------+
|  Readium     |
|  Go-Toolkit  |
|  (Parsing)   |
+--------------+
       |
       |
       v
+----------------+
|  Google Cloud  |
|  (Publication  |
|  Storage)      |
+----------------+
```

> [!NOTE] 
> In the foreseeable future, all components and custom hooks of Thorium Web will be exported as Library, following the model of [React Spectrum](https://github.com/adobe/react-spectrum). This way you will be able to build a Reader using your framework of choice.

## Prerequisites for implementation

> [!IMPORTANT]
> The following are outside of the control of the Thorium Web project and must be implemented by the deployer.

Thorium Web follows the [Readium Architecture](https://readium.org/architecture/). To get started with the implementation of Thorium Web, we need to set up a few things first:

- **Server with publications:** We need a server that can store and serve publications with a Readium Web Publication Manifest and a Positions List. The resources of the publication must be fetchable separately. This can be a simple file server or a more complex system like Google Cloud Storage.
- **Deployment platform for Next.js app:** We need a platform to deploy the Next.js app to. This can be Cloudflare Pages, Vercel, or another platform that supports Next.js deployments. [See Next.js documentation for more information](https://nextjs.org/docs/app/building-your-application/deploying).

Route `/read` expects a URL-encoded `book` parameter pointing to the Publication URL or the Readium Web Publication Manifest of the publication you want to display and navigate. The Readium Web Publication Manifest will be fetched from this URL. Then, in a second step, the Positions List will automatically be fetched by `Reader`.

A handful of publications are listed at the root of the app for demonstration purposes. You could update this to have a dynamic collection with covers, etc.

## Configuration and Setup

One of the core principles of Thorium Web is to make everything customizable, so that implementers don't need to maintain a fork with heavily modified components. 

We regularly assess whether we're meeting this requirement, and we encourage implementers to send feature requests if they need something that's not currently customizable. 

Our goal is to provide a flexible and adaptable platform that can meet the needs of a wide range of use cases, without requiring extensive modifications, which should explain our reliance on a Preferences file.

- **Install project dependencies:** Run `pnpm install` to install all the dependencies required by the project.
- **Development:** Run `pnpm dev` to start the development server.
- **Build:** Run `pnpm build` to build the project for production.
- **Customization:** See [Customization in docs](../docs/customization/Customization.md) for details on how to customize the project through the Preferences file.

## Troubleshooting and Debugging

Thorium Web is a complex project that relies heavily on several other projects, including ts-toolkit and ReadiumCSS. As a result, some issues may have roots in these projects, and may require reporting in their respective issue trackers.

> [!IMPORTANT]
> Before reporting an issue in the Thorium Web issue tracker, please check the following:
> - **ts-toolkit:** If the issue is related to the ts-toolkit (Navigator, injectables, shared models), please report it in the [ts-toolkit issue tracker](https://github.com/readium/ts-toolkit/issues).
> - **ReadiumCSS:** If the issue is related to EPUB rendering and the application of settings, please report it in the [ReadiumCSS issue tracker](https://github.com/readium/readium-css/issues).

By reporting issues in the correct issue tracker, we can ensure that the root cause of the problem is addressed and fixed in the relevant project.

Let's take a step back and focus on the Thorium Web-specific troubleshooting and debugging tips.

### Development Environment

In the development environment, Next.js provides an error overlay that can help you identify and debug issues. This overlay is enabled by default when you run `pnpm dev`.

You can rely on this error overlay to get information about errors and warnings in your application. It will provide you with details about the error, including the file and line number where the error occurred, as well as a stack trace.

### Diagnostic and Debugging Tools

In addition to the error overlay provided by Next.js, there are of course several debugging tools that you can use to troubleshoot issues with Thorium Web:

- **Browser DevTools:** The browser's DevTools provide a wealth of information about the application, including the ability to inspect elements, view the console, and debug JavaScript code.
- **Console Logs:** Thorium Web and/or Readium ts-toolkit log important events and errors to the console. You can view these logs in the browser's DevTools.
- **Terminal output:** This terminal output is a useful resource for debugging issues with Next.js, and can help you identify problems with the development server or the application itself. It will also run a linter on build, that should help catch some problems.

By using these tips and techniques, you should be able to troubleshoot and debug common issues with Thorium Web. If you're still having trouble, don't hesitate to reach out to the community for help!

### Common Issues

One common issue that can occur in Next.js applications is the `window` object being `undefined`. This can happen when trying to access the `window` object on the server-side, where it is not available. In particular, this error can occur when trying to pre-render pages that use the `Navigator` from ts-toolkit, which needs to be client-side. 

## Best Practices and Recommendations

Here are some best practices and recommendations for working with Thorium Web:

- **Follow Next.js guidelines:** Thorium Web is built on top of Next.js, so it's essential to follow Next.js guidelines and best practices. Thorium Web follows the [Project Structure of Next.js](https://nextjs.org/docs/app/getting-started/project-structure) with the strategy of storing all application code in shared folders in the root of the project and keeping the app directory purely for routing purposes.
- **Use TypeScript:** Thorium Web uses TypeScript, so it's recommended to use TypeScript to ensure type safety and maintainability. The types for Thorium Web are kept in models so that they can be shared throughout the project.
- **Use CSS modules:** Thorium Web uses CSS modules (`.module.css` files) for styling, so it's recommended to use CSS modules for styling your components.
- **Follow accessibility guidelines:** Follow accessibility guidelines to ensure your application is accessible to users with disabilities. We've chosen to use React Aria to help with accessibility, as it provides a set of pre-built, accessible components and hooks. When creating custom components, use React Aria's custom hooks to ensure they are accessible and consistent with the rest of the application.
- **Make components customizable:** Make components customizable by exposing props and using them to control the component's behavior and appearance. This will allow users to easily customize the component to fit their needs through the app’s Preferences.
- **Test thoroughly:** Test your application thoroughly to ensure it works as expected on different devices and browsers.

## Glossary

[Go-Toolkit](https://github.com/readium/go-toolkit): The Go Toolkit is used to parse and stream packaged resources (EPUB, CBZ). It outputs a Readium Web Publication Manifest for each of them over HTTPS along with various complementary API responses (Positions List, Guided Navigation), and stream individual resources of these publications over HTTPS.

[Readium Architecture](https://readium.org/architecture/): All Readium implementations (mobile, desktop or Web) are split in two main modules, which use the Readium Web Publication Manifest to communicate together. In Thorium Web, the Publication Server is responsible for serving a Readium Web Publication Manifest and the resources of a publication over HTTPS, and the Navigator is meant to navigate in the resources of a publication.

[Preferences API](https://readium.org/architecture/proposals/009-preferences-api.html): The Preferences API is a way to submit a set of Preferences to the Navigator, which will then recalculate its settings and update the presentation. It is used in TS-Toolkit to configure Navigators.

[Readium CSS](https://readium.org/readium-css/): Readium CSS is a CSS library whose purpose is to style EPUB publications in a reliable manner. It is used by Thorium Web to style EPUB publications through the Preferences API.

[Readium Positions List](https://readium.org/architecture/models/locators/positions/): The Readium Positions List is a JSON-based document that contains the positions of the publication. It allows users to reference or access a specific position.

[Readium Web](https://readium.org/web/): Readium Web is a toolkit for building Web Readers. It currently supports EPUB, with plans for PDF, audiobooks and comics/manga/webtoons in future revisions. It is divided into two separate toolkits: the client-side TS-Toolkit, and the server-side Go-Toolkit.

[Readium Web Publication Manifest](https://readium.org/webpub-manifest/): The Readium Web Publication Manifest is a JSON-based document meant to represent and distribute publications over HTTPS. It is the primary exchange format used in the Readium Architecture and serves as the main building block for OPDS 2.0.

[TS-Toolkit](https://github.com/readium/ts-toolkit): The TS-Toolkit interacts with a Readium Web Publication Manifest and related APIs, provide various navigators to handle various publication types (reflowable publications and fixed layout for now), along with the lower level API associated to these navigators (for example the Preferences API or Decorator API).