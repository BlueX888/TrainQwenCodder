class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0; // 状态信号：击杀计数
    this.particleEmitCount = 0; // 状态信号：粒子发射次数
  }

  preload() {
    // 创建粉色敌人纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('enemy', 32, 32);
    graphics.destroy();

    // 创建粒子纹理（小圆点）
    const particleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    particleGraphics.fillStyle(0xff1493, 1); // 深粉色
    particleGraphics.fillCircle(4, 4, 4);
    particleGraphics.generateTexture('particle', 8, 8);
    particleGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#2d2d2d');

    // 创建粒子发射器（初始不发射）
    this.particleEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: 100, max: 300 }, // 扩散速度
      angle: { min: 0, max: 360 }, // 全方向扩散
      scale: { start: 1, end: 0 }, // 从正常大小缩小到0
      alpha: { start: 1, end: 0 }, // 从不透明到透明
      lifespan: 4000, // 持续4秒
      gravityY: 0,
      quantity: 15, // 每次发射15个粒子
      frequency: -1, // 手动触发，不自动发射
      blendMode: 'ADD' // 叠加混合模式，更有爆炸感
    });

    // 创建粉色敌人
    this.enemy = this.add.sprite(400, 300, 'enemy').setInteractive();
    this.enemy.setScale(1.5);

    // 添加鼠标悬停效果
    this.enemy.on('pointerover', () => {
      this.enemy.setTint(0xffffff);
    });

    this.enemy.on('pointerout', () => {
      this.enemy.clearTint();
    });

    // 点击敌人触发死亡效果
    this.enemy.on('pointerdown', (pointer) => {
      this.killEnemy(this.enemy.x, this.enemy.y);
    });

    // 添加提示文本
    this.add.text(400, 50, 'Click the pink enemy to trigger explosion!', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 添加状态显示
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '16px',
      color: '#00ff00'
    });
    this.updateStatusText();

    // 添加重生按钮（敌人死亡后显示）
    this.respawnButton = this.add.text(400, 350, 'Click to Respawn Enemy', {
      fontSize: '18px',
      color: '#ffff00',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive().setVisible(false);

    this.respawnButton.on('pointerdown', () => {
      this.respawnEnemy();
    });
  }

  killEnemy(x, y) {
    if (!this.enemy.visible) return;

    // 隐藏敌人
    this.enemy.setVisible(false);

    // 在敌人位置触发粒子爆炸
    this.particleEmitter.setPosition(x, y);
    this.particleEmitter.explode(15); // 一次性发射15个粒子

    // 更新状态
    this.killCount++;
    this.particleEmitCount++;
    this.updateStatusText();

    // 显示重生按钮
    this.respawnButton.setVisible(true);

    // 添加爆炸音效提示（视觉反馈）
    const explosionText = this.add.text(x, y, 'BOOM!', {
      fontSize: '32px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 爆炸文字动画
    this.tweens.add({
      targets: explosionText,
      y: y - 50,
      alpha: 0,
      scale: 2,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        explosionText.destroy();
      }
    });

    console.log(`Enemy killed at (${x}, ${y}). Total kills: ${this.killCount}`);
  }

  respawnEnemy() {
    // 随机位置重生敌人
    const x = Phaser.Math.Between(100, 700);
    const y = Phaser.Math.Between(150, 450);
    
    this.enemy.setPosition(x, y);
    this.enemy.setVisible(true);
    this.respawnButton.setVisible(false);

    console.log(`Enemy respawned at (${x}, ${y})`);
  }

  updateStatusText() {
    this.statusText.setText([
      `Kills: ${this.killCount}`,
      `Explosions: ${this.particleEmitCount}`,
      `Enemy Active: ${this.enemy && this.enemy.visible ? 'Yes' : 'No'}`
    ]);
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};

const game = new Phaser.Game(config);