class ParticleScene extends Phaser.Scene {
  constructor() {
    super('ParticleScene');
    this.currentParticleIndex = 0;
    this.totalParticleTypes = 20;
    this.particleEmitters = [];
    this.particleColors = [
      { name: 'Red', color: 0xff0000 },
      { name: 'Orange', color: 0xff8800 },
      { name: 'Yellow', color: 0xffff00 },
      { name: 'Lime', color: 0x88ff00 },
      { name: 'Green', color: 0x00ff00 },
      { name: 'Cyan', color: 0x00ffff },
      { name: 'Blue', color: 0x0088ff },
      { name: 'Navy', color: 0x0000ff },
      { name: 'Purple', color: 0x8800ff },
      { name: 'Magenta', color: 0xff00ff },
      { name: 'Pink', color: 0xff88ff },
      { name: 'White', color: 0xffffff },
      { name: 'Silver', color: 0xcccccc },
      { name: 'Gray', color: 0x888888 },
      { name: 'Brown', color: 0x8b4513 },
      { name: 'Gold', color: 0xffd700 },
      { name: 'Teal', color: 0x008080 },
      { name: 'Olive', color: 0x808000 },
      { name: 'Maroon', color: 0x800000 },
      { name: 'Coral', color: 0xff7f50 }
    ];
  }

  preload() {
    // 创建20种不同颜色的粒子纹理
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

    // 创建20个粒子发射器，每个对应一种颜色
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
      emitter.setVisible(index === 0);
      emitter.stop();
      if (index === 0) {
        emitter.start();
      }
      
      this.particleEmitters.push(emitter);
    });

    // 创建状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 创建控制说明文本
    this.add.text(10, 560, 'Controls: W/A/S/D to switch particle types', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 添加键盘事件监听
    this.input.keyboard.on('keydown-W', () => this.switchParticle(-5));
    this.input.keyboard.on('keydown-A', () => this.switchParticle(-1));
    this.input.keyboard.on('keydown-S', () => this.switchParticle(5));
    this.input.keyboard.on('keydown-D', () => this.switchParticle(1));

    // 鼠标移动时更新粒子发射器位置
    this.input.on('pointermove', (pointer) => {
      this.particleEmitters[this.currentParticleIndex].setPosition(pointer.x, pointer.y);
    });

    // 点击时创建爆发效果
    this.input.on('pointerdown', (pointer) => {
      const currentEmitter = this.particleEmitters[this.currentParticleIndex];
      currentEmitter.explode(30, pointer.x, pointer.y);
    });
  }

  switchParticle(delta) {
    // 停止当前粒子发射器
    this.particleEmitters[this.currentParticleIndex].stop();
    this.particleEmitters[this.currentParticleIndex].setVisible(false);

    // 更新索引（循环）
    this.currentParticleIndex = (this.currentParticleIndex + delta + this.totalParticleTypes) % this.totalParticleTypes;

    // 启动新的粒子发射器
    const newEmitter = this.particleEmitters[this.currentParticleIndex];
    newEmitter.setVisible(true);
    newEmitter.start();
    
    // 更新位置到鼠标当前位置
    const pointer = this.input.activePointer;
    newEmitter.setPosition(pointer.x, pointer.y);

    // 更新状态文本
    this.updateStatusText();
  }

  updateStatusText() {
    const colorData = this.particleColors[this.currentParticleIndex];
    this.statusText.setText(
      `Particle Type: ${this.currentParticleIndex + 1}/${this.totalParticleTypes}\n` +
      `Color: ${colorData.name}\n` +
      `Hex: #${colorData.color.toString(16).padStart(6, '0').toUpperCase()}`
    );
  }

  update(time, delta) {
    // 可选：添加一些动态效果
    // 例如让粒子发射器随时间变化参数
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

new Phaser.Game(config);