## Windrose Panel for Grafana

Render metrics into a windrose chart.

### Screenshots

![](https://i.imgur.com/ADjvKwA.png)

![](https://i.imgur.com/HXLgwLB.png)

### Environments

For linux ubuntu 16.04, first get nvm installed. some instructions can be found [here](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-16-04).

After nvm installation, activate one engine. Here version 8.x is picked for no particular reason.

```
nvm install v8
nvm use v8
```

### Building

To complie, run:

```
npm install -g yarn
yarn install --pure-lockfile
grunt
```

### Roadmap

* This plugin is modified from [plotly panel for grafana](https://github.com/NatelEnergy/grafana-plotly-panel) and currently has many inconsistent variable names to be refactored.

### Authors and contributors

The Grafana Windrose Plugin was initiated as a part of the joint research project among RCAS, RCEC of Academia Sinica of Taiwan; NCHC, TORI of Natioanl Applied Research Laboratories of Taiwan and Taiwan Generations Corporation.  It was developed by Sea Bunny Corporation and released under MIT license.

The contacts of developers are

Chih-Yu Kuo
Research Fellow,
RCAS, Academia Sinica,
Taipei, Taiwan
cykuo06@gate.sinica.edu.tw

and

Chun-Yun Wang,
Sea Bunny Corporation,
Taipei, Taiwan.
cloud@seabunny.tech

RCAS: Research Center for Applied Sciences, RCEC: Research Center for Environmental Changes, NCHC: National Center for High-performance Computing, TORI: Taiwan Ocean Research Institute.

The code based is modified from a fork of [plotly panel for grafana](https://github.com/NatelEnergy/grafana-plotly-panel).
