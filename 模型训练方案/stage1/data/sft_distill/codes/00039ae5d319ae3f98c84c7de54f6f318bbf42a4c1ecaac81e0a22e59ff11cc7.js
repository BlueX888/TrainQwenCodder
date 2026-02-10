class ParticleShowcaseScene extends Phaser.Scene {
  constructor() {
    super('ParticleShowcaseScene');
    this.currentParticleIndex = 0;
    this.particleEmitters = [];
    this.particleColors = [
      { name: 'Red', color: 0xff0000 },
      { name: 'Green', color: 0x00ff00 },
      { name: 'Blue', color: 0x0000ff },
      { name: 'Yellow', color: 0xffff00 },
      { name: 'Cyan', color: 0x00ffff },
      { name: 'Magenta', color: 0xff00ff },
      { name: 'Orange', color: 0xff8800 },
      { name: 'Purple', color: 0x8800ff },
      { name: 'Pink', color: 0xff88ff },
      { name: 'Lime', color: 0x88ff00 },
      { name: 'Teal', color: 0x008888 },
      { name: 'Navy', color: 0x000088 },
      { name: 'Maroon', color: 0x880000 },
      { name: 'Olive', color: 0x888800 },
      { name: 'Coral', color: 0xff7f50 },
      { name: 'Gold', color: 0xffd700 },
      { name: 'Silver', color: 0xc0c0c0 },
      { name: 'Crimson', color: 0xdc143c },
      { name: 'Indigo', color: 0x4b0082 },
      { name: 'Turquoise', color: 0x40e0d0 }
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
    // 添加背景色
    this.cameras.main.setBackgroundColor(0x222222);

    // 创建标题文本
    this.titleText = this.add.text(400, 30, 'Particle Color Showcase', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 创建说明文本
    this.instructionText = this.add.text(400, 70, 'Press LEFT/RIGHT arrows to switch particle types', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
      align: 'center'
    }).setOrigin(0.5);

    // 创建当前粒子信息文本
    this.infoText = this.add.text(400, 550, '', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 创建20个粒子发射器，每个使用不同的颜色和效果
    this.particleColors.forEach((colorData, index) => {
      const emitter = this.add.particles(400, 300, `particle${index}`, {
        speed: { min: 100, max: 200 },
        angle: { min: 0, max: 360 },
        scale: { start: 1, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 2000,
        frequency: 50,
        blendMode: 'ADD',
        maxParticles: 100,
        gravityY: this.getGravityForIndex(index),
        rotate: { min: 0, max: 360 },
        bounce: 0.5
      });

      // 初始时隐藏所有发射器
      emitter.stop();
      this.particleEmitters.push(emitter);
    });

    // 显示第一个粒子发射器
    this.switchParticle(0);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加键盘事件监听（防止按住不放时连续触发）
    this.leftKeyPressed = false;
    this.rightKeyPressed = false;

    // 状态信号变量
    this.particleSwitchCount = 0; // 记录切换次数
  }

  update() {
    // 左方向键切换到上一个粒子
    if (this.cursors.left.isDown && !this.leftKeyPressed) {
      this.leftKeyPressed = true;
      this.currentParticleIndex--;
      if (this.currentParticleIndex < 0) {
        this.currentParticleIndex = this.particleColors.length - 1;
      }
      this.switchParticle(this.currentParticleIndex);
      this.particleSwitchCount++;
    }
    
    if (this.cursors.left.isUp) {
      this.leftKeyPressed = false;
    }

    // 右方向键切换到下一个粒子
    if (this.cursors.right.isDown && !this.rightKeyPressed) {
      this.rightKeyPressed = true;
      this.currentParticleIndex++;
      if (this.currentParticleIndex >= this.particleColors.length) {
        this.currentParticleIndex = 0;
      }
      this.switchParticle(this.currentParticleIndex);
      this.particleSwitchCount++;
    }
    
    if (this.cursors.right.isUp) {
      this.rightKeyPressed = false;
    }
  }

  switchParticle(index) {
    // 停止所有粒子发射器
    this.particleEmitters.forEach(emitter => {
      emitter.stop();
    });

    // 启动选中的粒子发射器
    this.particleEmitters[index].start();

    // 更新信息文本
    const colorData = this.particleColors[index];
    const colorHex = '#' + colorData.color.toString(16).padStart(6, '0');
    this.infoText.setText(
      `Particle ${index + 1}/20: ${colorData.name} (${colorHex})\n` +
      `Switch Count: ${this.particleSwitchCount}`
    );
    this.infoText.setColor(colorHex);
  }

  // 为不同索引的粒子提供不同的重力效果
  getGravityForIndex(index) {
    const patterns = [0, 50, 100, -50, -100, 150, -150, 200, -200, 0];
    return patterns[index % patterns.length];
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: ParticleShowcaseScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};

const game = new Phaser.Game(config);