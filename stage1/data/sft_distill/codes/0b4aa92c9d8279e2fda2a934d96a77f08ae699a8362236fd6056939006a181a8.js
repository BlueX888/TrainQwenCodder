class ParticleScene extends Phaser.Scene {
  constructor() {
    super('ParticleScene');
    this.currentParticleIndex = 0;
    this.particleConfigs = [];
  }

  preload() {
    // 创建10种不同颜色的粒子纹理
    this.createParticleTextures();
  }

  createParticleTextures() {
    const colors = [
      { name: 'red', color: 0xff0000, label: 'Red Fire' },
      { name: 'blue', color: 0x0088ff, label: 'Blue Ice' },
      { name: 'green', color: 0x00ff00, label: 'Green Nature' },
      { name: 'yellow', color: 0xffff00, label: 'Yellow Lightning' },
      { name: 'purple', color: 0xff00ff, label: 'Purple Magic' },
      { name: 'orange', color: 0xff8800, label: 'Orange Flame' },
      { name: 'cyan', color: 0x00ffff, label: 'Cyan Water' },
      { name: 'pink', color: 0xff69b4, label: 'Pink Blossom' },
      { name: 'white', color: 0xffffff, label: 'White Snow' },
      { name: 'gold', color: 0xffd700, label: 'Gold Sparkle' }
    ];

    colors.forEach((colorData, index) => {
      // 为每种颜色创建纹理
      const graphics = this.add.graphics();
      graphics.fillStyle(colorData.color, 1);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture(`particle_${colorData.name}`, 16, 16);
      graphics.destroy();

      // 配置每种粒子的独特效果
      this.particleConfigs.push({
        texture: `particle_${colorData.name}`,
        label: colorData.label,
        config: this.getParticleConfig(index, `particle_${colorData.name}`)
      });
    });
  }

  getParticleConfig(index, texture) {
    // 为每种粒子类型创建不同的效果配置
    const configs = [
      // 0: Red Fire - 向上喷射
      {
        speed: { min: 100, max: 200 },
        angle: { min: -100, max: -80 },
        scale: { start: 1, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 2000,
        frequency: 50,
        blendMode: 'ADD'
      },
      // 1: Blue Ice - 缓慢飘落
      {
        speed: { min: 20, max: 50 },
        angle: { min: 60, max: 120 },
        scale: { start: 0.5, end: 1 },
        alpha: { start: 0.8, end: 0 },
        lifespan: 3000,
        frequency: 100,
        blendMode: 'NORMAL'
      },
      // 2: Green Nature - 螺旋上升
      {
        speed: 150,
        angle: { min: -90, max: -90 },
        scale: { start: 0.8, end: 0.2 },
        alpha: { start: 1, end: 0 },
        lifespan: 2500,
        frequency: 80,
        blendMode: 'ADD',
        gravityY: -50
      },
      // 3: Yellow Lightning - 快速爆发
      {
        speed: { min: 200, max: 400 },
        angle: { min: 0, max: 360 },
        scale: { start: 1.2, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 800,
        frequency: 30,
        blendMode: 'ADD'
      },
      // 4: Purple Magic - 环形扩散
      {
        speed: 100,
        angle: { min: 0, max: 360 },
        scale: { start: 0.3, end: 1.5 },
        alpha: { start: 1, end: 0 },
        lifespan: 2000,
        frequency: 60,
        blendMode: 'ADD'
      },
      // 5: Orange Flame - 火焰效果
      {
        speed: { min: 80, max: 150 },
        angle: { min: -110, max: -70 },
        scale: { start: 1.5, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 1500,
        frequency: 40,
        blendMode: 'ADD',
        gravityY: -100
      },
      // 6: Cyan Water - 水滴效果
      {
        speed: { min: 50, max: 100 },
        angle: { min: 70, max: 110 },
        scale: { start: 0.6, end: 0.3 },
        alpha: { start: 0.9, end: 0 },
        lifespan: 2000,
        frequency: 70,
        blendMode: 'NORMAL',
        gravityY: 200,
        bounce: 0.6
      },
      // 7: Pink Blossom - 花瓣飘落
      {
        speed: { min: 30, max: 80 },
        angle: { min: 45, max: 135 },
        scale: { start: 1, end: 0.5 },
        alpha: { start: 0.8, end: 0 },
        lifespan: 3500,
        frequency: 90,
        blendMode: 'NORMAL',
        gravityY: 50
      },
      // 8: White Snow - 雪花飘落
      {
        speed: { min: 20, max: 60 },
        angle: { min: 60, max: 120 },
        scale: { start: 0.8, end: 0.8 },
        alpha: { start: 1, end: 0 },
        lifespan: 4000,
        frequency: 100,
        blendMode: 'NORMAL',
        gravityY: 30
      },
      // 9: Gold Sparkle - 闪烁效果
      {
        speed: { min: 50, max: 150 },
        angle: { min: 0, max: 360 },
        scale: { start: 1.5, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 1200,
        frequency: 50,
        blendMode: 'ADD'
      }
    ];

    return {
      ...configs[index],
      texture: texture
    };
  }

  create() {
    // 设置背景色
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 创建粒子发射器
    this.emitter = this.add.particles(400, 300, this.particleConfigs[0].texture, this.particleConfigs[0].config);

    // 创建UI文本
    this.statusText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(20, 60, 'Press SPACE to switch particle type', {
      fontSize: '18px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 状态信号：当前粒子索引
    this.particleIndexDisplay = this.add.text(20, 100, '', {
      fontSize: '16px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 更新初始状态显示
    this.updateStatusDisplay();

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => {
      this.switchParticle();
    });
  }

  switchParticle() {
    // 切换到下一个粒子类型
    this.currentParticleIndex = (this.currentParticleIndex + 1) % this.particleConfigs.length;

    // 停止当前发射器
    this.emitter.stop();
    
    // 移除旧发射器
    this.emitter.destroy();

    // 创建新的粒子发射器
    const currentConfig = this.particleConfigs[this.currentParticleIndex];
    this.emitter = this.add.particles(400, 300, currentConfig.texture, currentConfig.config);

    // 更新状态显示
    this.updateStatusDisplay();
  }

  updateStatusDisplay() {
    const currentConfig = this.particleConfigs[this.currentParticleIndex];
    this.statusText.setText(`Current: ${currentConfig.label}`);
    
    // 状态信号：显示当前索引（用于验证）
    this.particleIndexDisplay.setText(`Particle Index: ${this.currentParticleIndex} / ${this.particleConfigs.length - 1}`);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: ParticleScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  }
};

new Phaser.Game(config);