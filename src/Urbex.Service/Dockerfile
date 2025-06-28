# Stage 1: Base image for runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Stage 2: SDK image for build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG CONFIGURATION=Release
WORKDIR /src

COPY ["Urbex.Service.sln", "."]
COPY ["Urbex.Service.Api/Urbex.Service.Api.csproj", "Urbex.Service.Api/"]
COPY ["Urbex.Service.Abstractions/Urbex.Service.Abstractions.csproj", "Urbex.Service.Abstractions/"]
COPY ["Urbex.Service.ApiClient/Urbex.Service.ApiClient.csproj", "Urbex.Service.ApiClient/"]
COPY ["Urbex.Service.Application/Urbex.Service.Application.csproj", "Urbex.Service.Application/"]
COPY ["Urbex.Service.Domain/Urbex.Service.Domain.csproj", "Urbex.Service.Domain/"]
COPY ["Urbex.Service.Dto/Urbex.Service.Dto.csproj", "Urbex.Service.Dto/"]
COPY ["Urbex.Service.Enums/Urbex.Service.Enums.csproj", "Urbex.Service.Enums/"]
COPY ["Urbex.Service.Persistence/Urbex.Service.Persistence.csproj", "Urbex.Service.Persistence/"]

RUN dotnet restore "Urbex.Service.Api/Urbex.Service.Api.csproj"

COPY . .

WORKDIR "/src/Urbex.Service.Api"
RUN dotnet build "Urbex.Service.Api.csproj" -c $CONFIGURATION -o /app/build

FROM build AS publish
RUN dotnet publish "Urbex.Service.Api.csproj" -c $CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Urbex.Service.Api.dll"]
