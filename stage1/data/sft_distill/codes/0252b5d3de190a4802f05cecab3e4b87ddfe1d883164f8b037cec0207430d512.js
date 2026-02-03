class ParticleSwitchScene extends Phaser.Scene {
  constructor() {
    super('ParticleSwitchScene');
    this.currentParticleIndex = 0; // 状态信号变量
    this.particleConfigs = [];
    this.emitter = null;
    this.infoText = null;
  }

  preload() {
    // 定义 12 种不同颜色配置
    this.particleConfigs = [
      { name: 'Red', color: 0xff0000, tint: 0xff0000 },
      { name: 'Green', color: 0x00ff00, tint: 0x00ff00 },
      { name: 'Blue', color: 0x0000ff, tint: 0x0000ff },
      { name: 'Yellow', color: 0xffff00, tint: 0xffff00 },
      { name: 'Cyan', color: 0x00ffff, tint: 0x00ffff },
      { name: 'Magenta', color: 0xff00ff, tint: 0xff00ff },
      { name: 'Orange', color: 0xff8800, tint: 0xff8800 },
      { name: 'Purple', color: 0x8800ff, tint: 0x8800ff },
      { name: 'Pink', color: 0xff88cc, tint: 0xff88cc },
      { name: 'Lime', color: 0x88ff00, tint: 0x88ff00 },
      { name: 'Teal', color: 0x008888, tint: 0x008888 },
      { name: 'White', color: 0xffffff, tint: 0xffffff }
    ];

    // 为每种颜色创建纹理
    this.particleConfigs.forEach((config, index) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(config.color, 1);
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
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 2000,
      frequency: 50,
      maxParticles: 100,
      blendMode: 'ADD'
    });

    // 添加信息文本
    this.infoText = this.add.text(400, 50, '', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.infoText.setOrigin(0.5);
    this.updateInfoText();

    // 添加说明文本
    const instructionText = this.add.text(400, 550, 'Press LEFT/RIGHT arrow keys to switch particle colors', {
      fontSize: '18px',
      color: '#aaaaaa',
      align: 'center'
    });
    instructionText.setOrigin(0.5);

    // 添加当前索引显示（用于验证）
    this.indexText = this.add.text(20, 20, '', {
      fontSize: '16px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateIndexText();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加键盘事件监听（防止连续触发）
    this.input.keyboard.on('keydown-LEFT', () => {
      this.switchParticle(-1);
    });

    this.input.keyboard.on('keydown-RIGHT', () => {
      this.switchParticle(1);
    });

    // 添加鼠标点击切换功能
    this.input.on('pointerdown', (pointer) => {
      if (pointer.x < 400) {
        this.switchParticle(-1);
      } else {
        this.switchParticle(1);
      }
    });
  }

  switchParticle(direction) {
    // 更新索引
    this.currentParticleIndex += direction;
    
    // 循环处理
    if (this.currentParticleIndex < 0) {
      this.currentParticleIndex = this.particleConfigs.length - 1;
    } else if (this.currentParticleIndex >= this.particleConfigs.length) {
      this.currentParticleIndex = 0;
    }

    // 更新粒子发射器纹理
    this.emitter.setTexture(`particle${this.currentParticleIndex}`);
    
    // 添加切换效果：短暂爆发
    this.emitter.explode(20, 400, 300);

    // 更新信息显示
    this.updateInfoText();
    this.updateIndexText();

    // 输出状态到控制台（便于验证）
    console.log(`Switched to particle ${this.currentParticleIndex}: ${this.particleConfigs[this.currentParticleIndex].name}`);
  }

  updateInfoText() {
    const config = this.particleConfigs[this.currentParticleIndex];
    this.infoText.setText(`Current Particle: ${config.name}\nColor: #${config.color.toString(16).padStart(6, '0').toUpperCase()}`);
    
    // 更新文本颜色以匹配当前粒子颜色
    this.infoText.setColor(`#${config.color.toString(16).padStart(6, '0')}`);
  }

  updateIndexText() {
    this.indexText.setText(`Index: ${this.currentParticleIndex + 1}/${this.particleConfigs.length}`);
  }

  update(time, delta) {
    // 可选：添加粒子发射器位置动画
    const offsetX = Math.sin(time * 0.001) * 50;
    const offsetY = Math.cos(time * 0.001) * 50;
    this.emitter.setPosition(400 + offsetX, 300 + offsetY);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: ParticleSwitchScene,
  render: {
    pixelArt: false,
    antialias: true
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态访问函数（用于测试验证）
window.getParticleState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentIndex: scene.currentParticleIndex,
    currentColor: scene.particleConfigs[scene.currentParticleIndex].name,
    totalColors: scene.particleConfigs.length
  };
};