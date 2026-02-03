class ParticleShowcaseScene extends Phaser.Scene {
  constructor() {
    super('ParticleShowcaseScene');
    this.currentParticleIndex = 0;
    this.particleEmitters = [];
    this.colorNames = [
      'Red', 'Green', 'Blue', 'Yellow', 'Cyan',
      'Magenta', 'Orange', 'Purple', 'Pink', 'Lime',
      'Teal', 'Indigo', 'Violet', 'Gold', 'Silver',
      'Coral', 'Salmon', 'Turquoise', 'Lavender', 'Crimson'
    ];
    this.colors = [
      0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0x00ffff,
      0xff00ff, 0xff8800, 0x8800ff, 0xff88ff, 0x88ff00,
      0x008888, 0x4400ff, 0xee82ee, 0xffd700, 0xc0c0c0,
      0xff7f50, 0xfa8072, 0x40e0d0, 0xe6e6fa, 0xdc143c
    ];
  }

  preload() {
    // 创建20种不同颜色的粒子纹理
    for (let i = 0; i < this.colors.length; i++) {
      const graphics = this.add.graphics();
      graphics.fillStyle(this.colors[i], 1);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture(`particle${i}`, 16, 16);
      graphics.destroy();
    }
  }

  create() {
    // 添加背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建20个粒子发射器
    for (let i = 0; i < this.colors.length; i++) {
      const emitter = this.add.particles(400, 300, `particle${i}`, {
        speed: { min: 100, max: 200 },
        angle: { min: 0, max: 360 },
        scale: { start: 1, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 2000,
        blendMode: 'ADD',
        frequency: 50,
        maxParticles: 100,
        emitting: false
      });
      
      this.particleEmitters.push(emitter);
    }

    // 激活第一个发射器
    this.particleEmitters[0].start();

    // 创建UI文本
    this.infoText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(20, 70, 
      'Press W/A/S/D to switch particles\nW: Previous | S: Next\nA: -5 | D: +5', {
      fontSize: '18px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 更新显示信息
    this.updateInfo();

    // 添加键盘输入
    this.cursors = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 防止按键重复触发
    this.lastKeyPressTime = 0;
    this.keyPressDelay = 200; // 毫秒
  }

  update(time, delta) {
    // 检测按键输入（带防抖）
    if (time - this.lastKeyPressTime > this.keyPressDelay) {
      let changed = false;
      let newIndex = this.currentParticleIndex;

      if (Phaser.Input.Keyboard.JustDown(this.cursors.w)) {
        // W键：上一个粒子
        newIndex = (this.currentParticleIndex - 1 + this.colors.length) % this.colors.length;
        changed = true;
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.s)) {
        // S键：下一个粒子
        newIndex = (this.currentParticleIndex + 1) % this.colors.length;
        changed = true;
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.a)) {
        // A键：后退5个
        newIndex = (this.currentParticleIndex - 5 + this.colors.length) % this.colors.length;
        changed = true;
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.d)) {
        // D键：前进5个
        newIndex = (this.currentParticleIndex + 5) % this.colors.length;
        changed = true;
      }

      if (changed) {
        this.switchParticle(newIndex);
        this.lastKeyPressTime = time;
      }
    }
  }

  switchParticle(newIndex) {
    // 停止当前发射器
    this.particleEmitters[this.currentParticleIndex].stop();
    
    // 更新索引
    this.currentParticleIndex = newIndex;
    
    // 启动新发射器
    this.particleEmitters[this.currentParticleIndex].start();
    
    // 更新显示信息
    this.updateInfo();
  }

  updateInfo() {
    const colorHex = this.colors[this.currentParticleIndex].toString(16).padStart(6, '0');
    this.infoText.setText(
      `Particle: ${this.currentParticleIndex + 1}/20\n` +
      `Color: ${this.colorNames[this.currentParticleIndex]}\n` +
      `Hex: #${colorHex.toUpperCase()}`
    );
    
    // 改变文本颜色以匹配当前粒子
    this.infoText.setColor('#' + colorHex);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: ParticleShowcaseScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  }
};

const game = new Phaser.Game(config);

// 可验证的状态信号
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentParticleIndex: scene.currentParticleIndex,
    currentColor: scene.colorNames[scene.currentParticleIndex],
    totalParticleTypes: scene.colors.length,
    activeEmitters: scene.particleEmitters.filter(e => e.emitting).length
  };
};