class ParticleScene extends Phaser.Scene {
  constructor() {
    super('ParticleScene');
    this.currentParticleIndex = 0;
    this.switchCount = 0; // 可验证的状态信号：切换次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 定义10种粒子配置
    this.particleConfigs = [
      { name: 'Red Fire', color: 0xff0000, tint: [0xff0000, 0xff6600, 0xffaa00] },
      { name: 'Blue Ice', color: 0x0088ff, tint: [0x0088ff, 0x00ccff, 0xaaffff] },
      { name: 'Green Nature', color: 0x00ff00, tint: [0x00ff00, 0x88ff00, 0xaaff88] },
      { name: 'Purple Magic', color: 0x8800ff, tint: [0x8800ff, 0xaa00ff, 0xff00ff] },
      { name: 'Yellow Lightning', color: 0xffff00, tint: [0xffff00, 0xffdd00, 0xffaa00] },
      { name: 'Cyan Water', color: 0x00ffff, tint: [0x00ffff, 0x00ddff, 0x88ffff] },
      { name: 'Orange Flame', color: 0xff8800, tint: [0xff8800, 0xff6600, 0xff4400] },
      { name: 'Pink Love', color: 0xff00ff, tint: [0xff00ff, 0xff88ff, 0xffaaff] },
      { name: 'White Holy', color: 0xffffff, tint: [0xffffff, 0xdddddd, 0xaaaaaa] },
      { name: 'Dark Shadow', color: 0x444444, tint: [0x444444, 0x666666, 0x888888] }
    ];

    // 创建粒子纹理
    this.createParticleTextures();

    // 创建粒子发射器
    this.emitter = this.add.particles(400, 300, 'particle0', {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 2000,
      blendMode: 'ADD',
      frequency: 50,
      maxParticles: 100,
      tint: this.particleConfigs[0].tint
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 防止连续触发
    this.lastSwitchTime = 0;
    this.switchCooldown = 200; // 毫秒

    // 创建UI文本
    this.infoText = this.add.text(20, 20, '', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    this.instructionText = this.add.text(20, 80, 
      'Press W/A/S/D to switch particle types', {
      fontSize: '16px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 状态信号文本
    this.statusText = this.add.text(20, 120, '', {
      fontSize: '16px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 更新显示
    this.updateDisplay();
  }

  createParticleTextures() {
    // 为每种颜色创建一个圆形粒子纹理
    this.particleConfigs.forEach((config, index) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(config.color, 1);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture(`particle${index}`, 16, 16);
      graphics.destroy();
    });
  }

  update(time, delta) {
    // 检查键盘输入
    if (time - this.lastSwitchTime > this.switchCooldown) {
      let switched = false;

      if (Phaser.Input.Keyboard.JustDown(this.cursors.W)) {
        this.currentParticleIndex = (this.currentParticleIndex + 1) % 10;
        switched = true;
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.A)) {
        this.currentParticleIndex = (this.currentParticleIndex - 1 + 10) % 10;
        switched = true;
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.S)) {
        this.currentParticleIndex = (this.currentParticleIndex + 2) % 10;
        switched = true;
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.D)) {
        this.currentParticleIndex = (this.currentParticleIndex - 2 + 10) % 10;
        switched = true;
      }

      if (switched) {
        this.switchParticleType();
        this.lastSwitchTime = time;
        this.switchCount++; // 增加切换计数
      }
    }

    // 更新状态显示
    this.statusText.setText(
      `Status: Switches=${this.switchCount} | Active=${this.emitter.getAliveParticleCount()} | Total=${this.emitter.getParticleCount()}`
    );
  }

  switchParticleType() {
    const config = this.particleConfigs[this.currentParticleIndex];
    
    // 更新粒子发射器的纹理和颜色
    this.emitter.setTexture(`particle${this.currentParticleIndex}`);
    this.emitter.setTint(config.tint);
    
    // 短暂爆发效果以展示新粒子
    this.emitter.explode(20);
    
    // 更新显示信息
    this.updateDisplay();
  }

  updateDisplay() {
    const config = this.particleConfigs[this.currentParticleIndex];
    this.infoText.setText(
      `Current: ${config.name} (${this.currentParticleIndex + 1}/10)`
    );
    
    // 更新信息文本颜色以匹配当前粒子
    this.infoText.setColor('#' + config.color.toString(16).padStart(6, '0'));
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: ParticleScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  }
};

new Phaser.Game(config);