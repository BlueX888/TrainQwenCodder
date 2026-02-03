class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemiesKilled = 0; // 状态信号：已击杀敌人数
  }

  preload() {
    // 创建灰色敌人纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('enemy', 40, 40);
    graphics.destroy();

    // 创建粒子纹理（红色圆形）
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xff0000, 1);
    particleGraphics.fillCircle(8, 8, 8);
    particleGraphics.generateTexture('particle', 16, 16);
    particleGraphics.destroy();
  }

  create() {
    // 添加标题文本
    this.add.text(400, 50, 'Click on the gray enemy to kill it', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 添加击杀计数显示
    this.killCountText = this.add.text(400, 100, 'Enemies Killed: 0', {
      fontSize: '20px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建灰色敌人
    this.enemy = this.physics.add.sprite(400, 300, 'enemy');
    this.enemy.setInteractive();

    // 创建粒子发射器（初始时停止）
    this.particleEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 2000,
      gravityY: 0,
      frequency: -1, // 手动触发
      quantity: 3, // 每次发射3个粒子
      emitting: false
    });

    // 点击敌人触发死亡
    this.enemy.on('pointerdown', () => {
      this.killEnemy(this.enemy);
    });

    // 添加说明文本
    this.add.text(400, 550, 'Particle explosion lasts 2 seconds with 3 particles', {
      fontSize: '16px',
      color: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);
  }

  killEnemy(enemy) {
    if (!enemy.active) return; // 防止重复触发

    // 增加击杀计数
    this.enemiesKilled++;
    this.killCountText.setText(`Enemies Killed: ${this.enemiesKilled}`);

    // 在敌人位置触发粒子爆炸
    this.particleEmitter.setPosition(enemy.x, enemy.y);
    
    // 发射3个粒子
    this.particleEmitter.explode(3);

    // 隐藏敌人
    enemy.setActive(false);
    enemy.setVisible(false);

    // 2秒后重新生成敌人（用于演示）
    this.time.delayedCall(2000, () => {
      this.respawnEnemy(enemy);
    });
  }

  respawnEnemy(enemy) {
    // 随机位置重生敌人
    const x = Phaser.Math.Between(100, 700);
    const y = Phaser.Math.Between(200, 500);
    
    enemy.setPosition(x, y);
    enemy.setActive(true);
    enemy.setVisible(true);
    enemy.setAlpha(0);

    // 淡入效果
    this.tweens.add({
      targets: enemy,
      alpha: 1,
      duration: 500,
      ease: 'Power2'
    });
  }

  update(time, delta) {
    // 游戏循环更新（当前无需额外逻辑）
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);

// 导出状态信号用于验证
if (typeof window !== 'undefined') {
  window.getGameState = () => ({
    enemiesKilled: game.scene.scenes[0].enemiesKilled
  });
}