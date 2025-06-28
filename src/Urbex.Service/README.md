Here is the `README.md` content:

---

# 🧱 Domain Driven Design Layered Webservice Template

This template scaffolds a complete solution using Onion Architecture and Domain-Driven Design (DDD) principles. It includes layered projects such as `.Api`, `.Application`, `.Domain`, `.Persistence`, and more, with naming conventions based on your specified `systemName` and `domainName`.

---

## 📦 Installation

To install the template locally, run the following command in the root directory where the `.template.config` folder is located:

```bash
dotnet new install .
```

---

## 🏗️ Usage

After installation, generate a new solution by running:

```bash
dotnet new base-layered-service --systemName MySystem --domainName MyDomain
```

This will produce a solution and project structure like:

```
MySystem.MyDomain.sln
MySystem.MyDomain.Api/
MySystem.MyDomain.Application/
MySystem.MyDomain.Domain/
MySystem.MyDomain.Persistence/
MySystem.MyDomain.Dto/
MySystem.MyDomain.Abstractions/
MySystem.MyDomain.ApiClient/
MySystem.MyDomain.Test/
```

All file and namespace references to `Urbex.Service` will be replaced with `MySystem.MyDomain`.

---

## ⚙️ Template Configuration

This template uses two symbol parameters:

* `--systemName`: Defines the top-level system or product grouping (default: `System`)
* `--domainName`: Defines the domain context or bounded context (default: `Domain`)

These values replace every instance of `Urbex.Service` in file names, folder names, namespaces, solution names, and `.csproj` files.

---

## 🚧 How to Create This Template

Before you can install and use this template, you must manually create a working prototype of the solution:

1. Structure and configure the solution to your standards.
2. Place everything inside a folder and add a `.template.config/template.json` with the template metadata.
3. Run `dotnet new install .` from the root directory to make the template available locally.

---
