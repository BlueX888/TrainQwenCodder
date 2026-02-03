class ParticleScene extends Phaser.Scene {
  constructor() {
    super('ParticleScene');
    this.currentParticleIndex = 0; // 状态信号：当前粒子类型索引
    this.particleConfigs = [];
    this.emitter = null;
    this.statusText = null;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建5种不同颜色的粒子纹理
    this.createParticleTextures();
    
    // 定义5种粒子配置
    this.particleConfigs = [
      {
        name: 'Red Explosion',
        texture: 'particle_red',
        color: 0xff0000,
        config: {
          speed: { min: 100, max: 300 },
          angle: { min: 0, max: 360 },
          scale: { start: 1, end: 0 },
          lifespan: 2000,
          frequency: 50,
          quantity: 3,
          blendMode: 'ADD'
        }
      },
      {
        name: 'Green Fountain',
        texture: 'particle_green',
        color: 0x00ff00,
        config: {
          speed: { min: 50, max: 150 },
          angle: { min: -100, max: -80 },
          scale: { start: 0.8, end: 0.2 },
          lifespan: 3000,
          frequency: 30,
          quantity: 5,
          gravityY: 200,
          blendMode: 'NORMAL'
        }
      },
      {
        name: 'Blue Spiral',
        texture: 'particle_blue',
        color: 0x0000ff,
        config: {
          speed: 100,
          angle: { min: 0, max: 360 },
          scale: { start: 0.5, end: 1.5 },
          lifespan: 4000,
          frequency: 20,
          quantity: 2,
          rotate: { start: 0, end: 360 },
          blendMode: 'ADD'
        }
      },
      {
        name: 'Yellow Rain',
        texture: 'particle_yellow',
        color: 0xffff00,
        config: {
          speedX: { min: -50, max: 50 },
          speedY: { min: 100, max: 200 },
          scale: { start: 1.2, end: 0.3 },
          lifespan: 2500,
          frequency: 40,
          quantity: 4,
          gravityY: 100,
          blendMode: 'NORMAL'
        }
      },
      {
        name: 'Purple Nebula',
        texture: 'particle_purple',
        color: 0xff00ff,
        config: {
          speed: { min: 20, max: 80 },
          angle: { min: 0, max: 360 },
          scale: { start: 2, end: 0 },
          alpha: { start: 1, end: 0 },
          lifespan: 5000,
          frequency: 60,
          quantity: 6,
          blendMode: 'ADD'
        }
      }
    ];

    // 创建粒子发射器
    this.emitter = this.add.particles(400, 300, this.particleConfigs[0].texture, 
      this.particleConfigs[0].config
    );

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.lastKeyPressTime = 0;
    this.keyPressDelay = 200; // 防止按键过快切换

    // 显示状态文本
    this.statusText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 显示说明文本
    this.add.text(20, 560, 'Press LEFT/RIGHT arrow keys to switch particle types', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加背景色以便更好地查看粒子效果
    this.cameras.main.setBackgroundColor(0x1a1a1a);
  }

  createParticleTextures() {
    const colors = [
      { key: 'particle_red', color: 0xff0000 },
      { key: 'particle_green', color: 0x00ff00 },
      { key: 'particle_blue', color: 0x0000ff },
      { key: 'particle_yellow', color: 0xffff00 },
      { key: 'particle_purple', color: 0xff00ff }
    ];

    colors.forEach(item => {
      const graphics = this.add.graphics();
      graphics.fillStyle(item.color, 1);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture(item.key, 16, 16);
      graphics.destroy();
    });
  }

  update(time, delta) {
    // 检测方向键切换粒子类型
    if (time - this.lastKeyPressTime > this.keyPressDelay) {
      if (this.cursors.left.isDown) {
        this.switchParticle(-1);
        this.lastKeyPressTime = time;
      } else if (this.cursors.right.isDown) {
        this.switchParticle(1);
        this.lastKeyPressTime = time;
      }
    }
  }

  switchParticle(direction) {
    // 更新当前粒子索引
    this.currentParticleIndex += direction;
    
    // 循环处理索引
    if (this.currentParticleIndex < 0) {
      this.currentParticleIndex = this.particleConfigs.length - 1;
    } else if (this.currentParticleIndex >= this.particleConfigs.length) {
      this.currentParticleIndex = 0;
    }

    // 销毁旧的粒子发射器
    if (this.emitter) {
      this.emitter.destroy();
    }

    // 创建新的粒子发射器
    const currentConfig = this.particleConfigs[this.currentParticleIndex];
    this.emitter = this.add.particles(400, 300, currentConfig.texture, 
      currentConfig.config
    );

    // 更新状态文本
    this.updateStatusText();

    // 输出状态信号到控制台（便于验证）
    console.log('Current Particle Index:', this.currentParticleIndex);
  }

  updateStatusText() {
    const currentConfig = this.particleConfigs[this.currentParticleIndex];
    this.statusText.setText(
      `Particle Type: ${this.currentParticleIndex + 1}/5\n` +
      `Name: ${currentConfig.name}\n` +
      `Color: #${currentConfig.color.toString(16).padStart(6, '0')}`
    );
    this.statusText.setColor('#' + currentConfig.color.toString(16).padStart(6, '0'));
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a1a',
  scene: ParticleScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  }
};

new Phaser.Game(config);