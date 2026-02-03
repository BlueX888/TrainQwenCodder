class ParticleScene extends Phaser.Scene {
  constructor() {
    super('ParticleScene');
    this.currentParticleType = 0; // 状态信号：当前粒子类型
    this.particleColors = [
      { color: 0xff0000, name: 'Red' },
      { color: 0x00ff00, name: 'Green' },
      { color: 0x0000ff, name: 'Blue' },
      { color: 0xffff00, name: 'Yellow' },
      { color: 0xff00ff, name: 'Magenta' },
      { color: 0x00ffff, name: 'Cyan' },
      { color: 0xff8800, name: 'Orange' },
      { color: 0x8800ff, name: 'Purple' },
      { color: 0x00ff88, name: 'Spring Green' },
      { color: 0xff0088, name: 'Rose' },
      { color: 0x88ff00, name: 'Lime' },
      { color: 0x0088ff, name: 'Sky Blue' },
      { color: 0xff4444, name: 'Light Red' },
      { color: 0x44ff44, name: 'Light Green' },
      { color: 0x4444ff, name: 'Light Blue' },
      { color: 0xffaa00, name: 'Amber' },
      { color: 0xaa00ff, name: 'Violet' },
      { color: 0x00ffaa, name: 'Turquoise' },
      { color: 0xffffff, name: 'White' },
      { color: 0x888888, name: 'Gray' }
    ];
  }

  preload() {
    // 为每种颜色创建粒子纹理
    this.particleColors.forEach((colorData, index) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(colorData.color, 1);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture(`particle${index}`, 16, 16);
      graphics.destroy();
    });
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建粒子发射器数组
    this.emitters = [];
    
    this.particleColors.forEach((colorData, index) => {
      const emitter = this.add.particles(400, 300, `particle${index}`, {
        speed: { min: 100, max: 200 },
        angle: { min: 0, max: 360 },
        scale: { start: 1, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 2000,
        frequency: 50,
        maxParticles: 100,
        blendMode: 'ADD'
      });
      
      // 初始时只显示第一个发射器
      if (index !== 0) {
        emitter.stop();
        emitter.setVisible(false);
      }
      
      this.emitters.push(emitter);
    });

    // 创建UI文本
    this.infoText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateInfoText();

    // 创建提示文本
    this.add.text(20, 560, 'Click to switch particle type', {
      fontSize: '18px',
      color: '#aaaaaa'
    });

    // 监听鼠标点击事件
    this.input.on('pointerdown', () => {
      this.switchParticleType();
    });

    // 让粒子跟随鼠标
    this.input.on('pointermove', (pointer) => {
      this.emitters[this.currentParticleType].setPosition(pointer.x, pointer.y);
    });
  }

  switchParticleType() {
    // 停止当前发射器
    this.emitters[this.currentParticleType].stop();
    this.emitters[this.currentParticleType].setVisible(false);

    // 切换到下一个类型
    this.currentParticleType = (this.currentParticleType + 1) % this.particleColors.length;

    // 启动新的发射器
    const pointer = this.input.activePointer;
    this.emitters[this.currentParticleType].setPosition(pointer.x, pointer.y);
    this.emitters[this.currentParticleType].setVisible(true);
    this.emitters[this.currentParticleType].start();

    // 更新信息文本
    this.updateInfoText();

    // 输出状态信号到控制台（用于验证）
    console.log(`Switched to particle type: ${this.currentParticleType}`);
  }

  updateInfoText() {
    const colorData = this.particleColors[this.currentParticleType];
    const colorHex = '#' + colorData.color.toString(16).padStart(6, '0');
    this.infoText.setText(
      `Type: ${this.currentParticleType + 1}/20\n` +
      `Color: ${colorData.name}\n` +
      `Hex: ${colorHex}`
    );
    this.infoText.setColor(colorHex);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
    // 例如：根据时间调整粒子效果参数
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: ParticleScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 暴露状态信号用于验证
window.getParticleState = () => {
  const scene = game.scene.scenes[0];
  return {
    currentParticleType: scene.currentParticleType,
    totalTypes: scene.particleColors.length,
    currentColor: scene.particleColors[scene.currentParticleType].name
  };
};