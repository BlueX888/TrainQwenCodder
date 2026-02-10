const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 可验证的状态信号
let currentParticleType = 0; // 当前粒子类型索引 (0-7)
let totalSwitches = 0; // 总切换次数

// 8种颜色配置
const particleColors = [
  { name: 'Red', color: 0xff0000, tint: 0xff0000 },
  { name: 'Green', color: 0x00ff00, tint: 0x00ff00 },
  { name: 'Blue', color: 0x0000ff, tint: 0x0000ff },
  { name: 'Yellow', color: 0xffff00, tint: 0xffff00 },
  { name: 'Magenta', color: 0xff00ff, tint: 0xff00ff },
  { name: 'Cyan', color: 0x00ffff, tint: 0x00ffff },
  { name: 'Orange', color: 0xff8800, tint: 0xff8800 },
  { name: 'Purple', color: 0x8800ff, tint: 0x8800ff }
];

let emitter;
let infoText;
let spaceKey;

function preload() {
  // 为每种颜色创建粒子纹理
  particleColors.forEach((colorConfig, index) => {
    const graphics = this.add.graphics();
    graphics.fillStyle(colorConfig.color, 1);
    graphics.fillCircle(8, 8, 8); // 圆心在(8,8)，半径8
    graphics.generateTexture(`particle${index}`, 16, 16);
    graphics.destroy();
  });
}

function create() {
  // 创建信息文本
  infoText = this.add.text(20, 20, '', {
    fontSize: '24px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 创建粒子发射器
  emitter = this.add.particles(400, 300, `particle${currentParticleType}`, {
    speed: { min: 100, max: 200 },
    angle: { min: 0, max: 360 },
    scale: { start: 1, end: 0 },
    blendMode: 'ADD',
    lifespan: 2000,
    gravityY: 50,
    quantity: 2,
    frequency: 50,
    maxParticles: 100
  });

  // 监听空格键
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  spaceKey.on('down', () => {
    switchParticleType.call(this);
  });

  // 添加使用说明
  this.add.text(20, 560, 'Press SPACE to switch particle type', {
    fontSize: '18px',
    color: '#888888'
  });

  // 更新信息显示
  updateInfoText();
}

function update(time, delta) {
  // 可以添加额外的更新逻辑
  // 例如：让粒子发射器跟随鼠标位置
  const pointer = this.input.activePointer;
  if (pointer.isDown) {
    emitter.setPosition(pointer.x, pointer.y);
  }
}

function switchParticleType() {
  // 切换到下一个粒子类型
  currentParticleType = (currentParticleType + 1) % particleColors.length;
  totalSwitches++;

  // 更新粒子发射器的纹理
  emitter.setTexture(`particle${currentParticleType}`);
  
  // 更新粒子颜色（使用tint）
  emitter.setParticleTint(particleColors[currentParticleType].tint);

  // 可选：添加一些变化让每种粒子更有特色
  switch(currentParticleType) {
    case 0: // Red - 火焰效果
      emitter.setConfig({
        speed: { min: 100, max: 200 },
        gravityY: 100,
        scale: { start: 1.2, end: 0 }
      });
      break;
    case 1: // Green - 向上飘散
      emitter.setConfig({
        speed: { min: 50, max: 150 },
        gravityY: -80,
        scale: { start: 0.8, end: 0 }
      });
      break;
    case 2: // Blue - 水滴效果
      emitter.setConfig({
        speed: { min: 80, max: 180 },
        gravityY: 150,
        scale: { start: 1, end: 0.3 }
      });
      break;
    case 3: // Yellow - 星星闪烁
      emitter.setConfig({
        speed: { min: 120, max: 220 },
        gravityY: 30,
        scale: { start: 1.5, end: 0 }
      });
      break;
    case 4: // Magenta - 爆炸效果
      emitter.setConfig({
        speed: { min: 200, max: 300 },
        gravityY: 50,
        scale: { start: 1, end: 0 }
      });
      break;
    case 5: // Cyan - 冰晶效果
      emitter.setConfig({
        speed: { min: 60, max: 140 },
        gravityY: -50,
        scale: { start: 0.9, end: 0.2 }
      });
      break;
    case 6: // Orange - 烟雾效果
      emitter.setConfig({
        speed: { min: 40, max: 100 },
        gravityY: -60,
        scale: { start: 1.3, end: 0 }
      });
      break;
    case 7: // Purple - 魔法效果
      emitter.setConfig({
        speed: { min: 90, max: 190 },
        gravityY: 20,
        scale: { start: 1.1, end: 0 }
      });
      break;
  }

  // 重置发射器位置到中心
  emitter.setPosition(400, 300);

  // 更新信息显示
  updateInfoText();

  // 输出状态到控制台（便于验证）
  console.log(`Particle Type: ${currentParticleType}, Total Switches: ${totalSwitches}`);
}

function updateInfoText() {
  const colorConfig = particleColors[currentParticleType];
  infoText.setText(
    `Particle Type: ${colorConfig.name} (${currentParticleType + 1}/8)\n` +
    `Total Switches: ${totalSwitches}`
  );
  infoText.setColor(`#${colorConfig.color.toString(16).padStart(6, '0')}`);
}

// 创建游戏实例
new Phaser.Game(config);