class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0; // 状态信号：击杀计数
    this.particleEmissions = 0; // 状态信号：粒子发射次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建粉色敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff69b4, 1); // 粉色
    enemyGraphics.fillCircle(25, 25, 25);
    enemyGraphics.generateTexture('pinkEnemy', 50, 50);
    enemyGraphics.destroy();

    // 创建粒子纹理（小圆点）
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xff1493, 1); // 深粉色
    particleGraphics.fillCircle(4, 4, 4);
    particleGraphics.generateTexture('particle', 8, 8);
    particleGraphics.destroy();

    // 创建粒子发射器（初始不发射）
    this.particleEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: 100, max: 300 }, // 扩散速度
      angle: { min: 0, max: 360 }, // 全方向
      scale: { start: 1, end: 0 }, // 从正常大小缩小到0
      alpha: { start: 1, end: 0 }, // 透明度渐变
      lifespan: 4000, // 持续4秒
      gravityY: 0,
      quantity: 15, // 每次发射15个粒子
      frequency: -1, // 不自动发射，手动触发
      blendMode: 'ADD' // 叠加混合模式
    });

    // 创建粉色敌人
    this.enemy = this.add.sprite(400, 300, 'pinkEnemy')
      .setInteractive({ cursor: 'pointer' });

    // 添加点击事件
    this.enemy.on('pointerdown', () => {
      this.triggerEnemyDeath();
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 添加提示文本
    this.add.text(400, 550, '点击粉色敌人触发粒子爆炸效果', {
      fontSize: '20px',
      color: '#ffff00'
    }).setOrigin(0.5);
  }

  triggerEnemyDeath() {
    if (!this.enemy.active) return; // 防止重复触发

    // 记录敌人位置
    const enemyX = this.enemy.x;
    const enemyY = this.enemy.y;

    // 更新状态信号
    this.killCount++;
    this.particleEmissions++;
    this.updateStatusText();

    // 敌人死亡动画（缩小并淡出）
    this.tweens.add({
      targets: this.enemy,
      scale: 0,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.enemy.setActive(false).setVisible(false);
        
        // 2秒后重生敌人
        this.time.delayedCall(2000, () => {
          this.respawnEnemy();
        });
      }
    });

    // 在敌人位置触发粒子爆炸
    this.particleEmitter.setPosition(enemyX, enemyY);
    this.particleEmitter.explode(15); // 一次性发射15个粒子

    // 添加爆炸闪光效果
    const flash = this.add.circle(enemyX, enemyY, 40, 0xffffff, 0.8);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => flash.destroy()
    });

    console.log(`Enemy killed! Total kills: ${this.killCount}, Particle emissions: ${this.particleEmissions}`);
  }

  respawnEnemy() {
    // 在随机位置重生敌人
    const x = Phaser.Math.Between(100, 700);
    const y = Phaser.Math.Between(100, 500);
    
    this.enemy.setPosition(x, y)
      .setScale(0)
      .setAlpha(0)
      .setActive(true)
      .setVisible(true);

    // 重生动画
    this.tweens.add({
      targets: this.enemy,
      scale: 1,
      alpha: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
  }

  updateStatusText() {
    this.statusText.setText([
      `击杀数: ${this.killCount}`,
      `粒子发射次数: ${this.particleEmissions}`
    ]);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

// Phaser 游戏配置
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

// 创建游戏实例
const game = new Phaser.Game(config);