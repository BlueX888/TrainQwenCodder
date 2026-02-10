class ParticleScene extends Phaser.Scene {
  constructor() {
    super('ParticleScene');
    this.currentParticleIndex = 0;
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
      { name: 'Turquoise', color: 0x40e0d0 },
      { name: 'Gold', color: 0xffd700 },
      { name: 'Silver', color: 0xc0c0c0 },
      { name: 'Crimson', color: 0xdc143c },
      { name: 'Indigo', color: 0x4b0082 }
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
    // 添加背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建粒子发射器
    this.emitter = this.add.particles(400, 300, `particle${this.currentParticleIndex}`, {
      speed: { min: 100, max: 300 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 2000,
      gravityY: 150,
      blendMode: 'ADD',
      frequency: 50,
      maxParticles: 100,
      emitting: true
    });

    // 添加文本显示
    this.infoText = this.add.text(20, 20, '', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.controlText = this.add.text(20, 70, 
      'Controls:\nW - Previous Type\nS - Next Type\nA - Previous Type (Alt)\nD - Next Type (Alt)', {
      fontSize: '16px',
      color: '#cccccc',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 防止按键重复触发
    this.keyW.on('down', () => this.changeParticleType(-1));
    this.keyA.on('down', () => this.changeParticleType(-1));
    this.keyS.on('down', () => this.changeParticleType(1));
    this.keyD.on('down', () => this.changeParticleType(1));

    // 更新显示
    this.updateInfo();

    // 添加鼠标点击移动发射器
    this.input.on('pointerdown', (pointer) => {
      this.emitter.setPosition(pointer.x, pointer.y);
    });
  }

  changeParticleType(direction) {
    // 计算新的粒子索引
    this.currentParticleIndex += direction;
    
    // 循环处理索引
    if (this.currentParticleIndex < 0) {
      this.currentParticleIndex = this.particleColors.length - 1;
    } else if (this.currentParticleIndex >= this.particleColors.length) {
      this.currentParticleIndex = 0;
    }

    // 更新粒子纹理
    this.emitter.setTexture(`particle${this.currentParticleIndex}`);
    
    // 更新显示信息
    this.updateInfo();

    // 添加视觉反馈 - 短暂爆发
    this.emitter.explode(20);
  }

  updateInfo() {
    const currentColor = this.particleColors[this.currentParticleIndex];
    const colorHex = '#' + currentColor.color.toString(16).padStart(6, '0');
    
    this.infoText.setText(
      `Particle Type: ${this.currentParticleIndex + 1}/20\n` +
      `Color: ${currentColor.name} (${colorHex})`
    );

    // 改变文本颜色以匹配当前粒子
    this.infoText.setColor(colorHex);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
    // 例如让发射器随时间移动
    const oscillation = Math.sin(time / 1000) * 100;
    // this.emitter.setPosition(400 + oscillation, 300);
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
      gravity: { y: 0 },
      debug: false
    }
  }
};

const game = new Phaser.Game(config);

// 状态验证信号
window.gameState = {
  currentParticleIndex: 0,
  totalParticleTypes: 20,
  getParticleInfo: function() {
    return {
      index: game.scene.scenes[0].currentParticleIndex,
      total: game.scene.scenes[0].particleColors.length,
      currentColor: game.scene.scenes[0].particleColors[game.scene.scenes[0].currentParticleIndex]
    };
  }
};