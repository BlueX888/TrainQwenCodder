class ParticleScene extends Phaser.Scene {
  constructor() {
    super('ParticleScene');
    this.currentTypeIndex = 0; // 状态信号：当前粒子类型索引
    this.switchCount = 0; // 状态信号：切换次数
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 定义8种颜色配置
    this.particleTypes = [
      { name: 'Red', color: 0xff0000 },
      { name: 'Green', color: 0x00ff00 },
      { name: 'Blue', color: 0x0000ff },
      { name: 'Yellow', color: 0xffff00 },
      { name: 'Cyan', color: 0x00ffff },
      { name: 'Magenta', color: 0xff00ff },
      { name: 'Orange', color: 0xff8800 },
      { name: 'Purple', color: 0x8800ff }
    ];

    // 创建8种颜色的纹理
    this.particleTypes.forEach((type, index) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(type.color, 1);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture(`particle${index}`, 16, 16);
      graphics.destroy();
    });

    // 创建粒子发射器
    this.emitter = this.add.particles(400, 300, `particle0`, {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 2000,
      frequency: 50,
      blendMode: 'ADD',
      gravityY: 0,
      maxParticles: 100,
      // 固定随机种子以保持确定性
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Circle(0, 0, 10)
      }
    });

    // 创建UI文本
    this.infoText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(20, 70, 
      'Press W/A/S/D to switch particle types\nW: Previous  S: Next\nA: -2  D: +2', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statsText = this.add.text(20, 550, '', {
      fontSize: '16px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 设置键盘输入
    this.keys = {
      w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 监听按键事件
    this.keys.w.on('down', () => this.switchParticleType(-1));
    this.keys.s.on('down', () => this.switchParticleType(1));
    this.keys.a.on('down', () => this.switchParticleType(-2));
    this.keys.d.on('down', () => this.switchParticleType(2));

    // 初始化显示
    this.updateUI();

    // 添加鼠标跟随效果
    this.input.on('pointermove', (pointer) => {
      this.emitter.setPosition(pointer.x, pointer.y);
    });
  }

  switchParticleType(delta) {
    // 更新索引（循环）
    this.currentTypeIndex = (this.currentTypeIndex + delta + this.particleTypes.length) % this.particleTypes.length;
    this.switchCount++;

    // 更换粒子纹理
    this.emitter.setTexture(`particle${this.currentTypeIndex}`);

    // 根据颜色调整粒子效果
    const currentType = this.particleTypes[this.currentTypeIndex];
    
    // 为不同颜色设置不同的粒子行为
    switch(this.currentTypeIndex) {
      case 0: // Red - 爆炸效果
        this.emitter.setSpeed({ min: 150, max: 250 });
        this.emitter.setGravityY(50);
        break;
      case 1: // Green - 上升效果
        this.emitter.setSpeed({ min: 50, max: 100 });
        this.emitter.setGravityY(-100);
        break;
      case 2: // Blue - 螺旋效果
        this.emitter.setSpeed({ min: 100, max: 150 });
        this.emitter.setGravityY(0);
        break;
      case 3: // Yellow - 快速扩散
        this.emitter.setSpeed({ min: 200, max: 300 });
        this.emitter.setGravityY(0);
        break;
      case 4: // Cyan - 缓慢漂浮
        this.emitter.setSpeed({ min: 30, max: 80 });
        this.emitter.setGravityY(-50);
        break;
      case 5: // Magenta - 下落效果
        this.emitter.setSpeed({ min: 80, max: 120 });
        this.emitter.setGravityY(150);
        break;
      case 6: // Orange - 火焰效果
        this.emitter.setSpeed({ min: 120, max: 180 });
        this.emitter.setGravityY(-80);
        break;
      case 7: // Purple - 均匀扩散
        this.emitter.setSpeed({ min: 100, max: 150 });
        this.emitter.setGravityY(0);
        break;
    }

    this.updateUI();
  }

  updateUI() {
    const currentType = this.particleTypes[this.currentTypeIndex];
    
    // 更新信息文本
    this.infoText.setText(
      `Current Particle: ${currentType.name} (${this.currentTypeIndex + 1}/8)`
    );
    this.infoText.setColor('#' + currentType.color.toString(16).padStart(6, '0'));

    // 更新统计信息
    this.statsText.setText(
      `Status - Type Index: ${this.currentTypeIndex} | Switch Count: ${this.switchCount}`
    );
  }

  update(time, delta) {
    // 可选：添加时间相关的粒子效果变化
    // 这里保持简单，主要通过键盘切换
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: ParticleScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};

// 创建游戏实例
new Phaser.Game(config);