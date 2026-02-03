class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0; // 状态信号：击杀计数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建橙色敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xFF6600, 1); // 橙色
    enemyGraphics.fillRect(0, 0, 50, 50);
    enemyGraphics.generateTexture('enemyTexture', 50, 50);
    enemyGraphics.destroy();

    // 创建粒子纹理（小圆点）
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xFF6600, 1); // 橙色粒子
    particleGraphics.fillCircle(4, 4, 4);
    particleGraphics.generateTexture('particleTexture', 8, 8);
    particleGraphics.destroy();

    // 创建橙色敌人
    this.enemy = this.add.sprite(400, 300, 'enemyTexture');
    this.enemy.setInteractive();

    // 创建粒子发射器（初始不激活）
    this.particleEmitter = this.add.particles(0, 0, 'particleTexture', {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 2000, // 持续2秒
      gravityY: 0,
      quantity: 12, // 一次发射12个粒子
      frequency: -1, // 手动触发，不自动发射
      emitting: false
    });

    // 点击敌人触发死亡
    this.enemy.on('pointerdown', () => {
      this.triggerEnemyDeath(this.enemy.x, this.enemy.y);
    });

    // 显示击杀计数
    this.killText = this.add.text(10, 10, 'Kills: 0', {
      fontSize: '24px',
      color: '#ffffff'
    });

    // 提示文本
    this.add.text(400, 500, 'Click the orange enemy to trigger particle explosion', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
  }

  triggerEnemyDeath(x, y) {
    if (!this.enemy.active) return; // 防止重复触发

    // 更新击杀计数
    this.killCount++;
    this.killText.setText('Kills: ' + this.killCount);

    // 在敌人位置触发粒子爆炸
    this.particleEmitter.setPosition(x, y);
    this.particleEmitter.explode(12); // 爆炸发射12个粒子

    // 销毁敌人
    this.enemy.destroy();

    // 2.5秒后重新生成敌人（方便测试）
    this.time.delayedCall(2500, () => {
      this.respawnEnemy();
    });
  }

  respawnEnemy() {
    // 在随机位置重新生成敌人
    const x = Phaser.Math.Between(100, 700);
    const y = Phaser.Math.Between(100, 500);
    
    this.enemy = this.add.sprite(x, y, 'enemyTexture');
    this.enemy.setInteractive();
    this.enemy.on('pointerdown', () => {
      this.triggerEnemyDeath(this.enemy.x, this.enemy.y);
    });
  }

  update(time, delta) {
    // 每帧更新逻辑（当前不需要）
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

new Phaser.Game(config);