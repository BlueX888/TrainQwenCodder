class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0; // 状态验证信号
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建黄色敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffff00, 1); // 黄色
    enemyGraphics.fillCircle(25, 25, 25);
    enemyGraphics.generateTexture('yellowEnemy', 50, 50);
    enemyGraphics.destroy();

    // 创建粒子纹理（红色小圆点）
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xff6600, 1); // 橙红色
    particleGraphics.fillCircle(4, 4, 4);
    particleGraphics.generateTexture('particle', 8, 8);
    particleGraphics.destroy();

    // 创建黄色敌人
    this.enemy = this.add.sprite(400, 300, 'yellowEnemy');
    this.enemy.setInteractive();

    // 创建粒子发射器（初始状态为关闭）
    this.particles = this.add.particles('particle');
    
    this.emitter = this.particles.createEmitter({
      speed: { min: 100, max: 300 }, // 粒子速度范围
      angle: { min: 0, max: 360 }, // 全方向发射
      scale: { start: 1, end: 0 }, // 粒子从正常大小缩小到0
      alpha: { start: 1, end: 0 }, // 透明度从1渐变到0
      lifespan: 4000, // 粒子生命周期4秒
      gravityY: 0,
      quantity: 20, // 每次爆炸发射20个粒子
      frequency: -1, // 设置为-1表示不自动发射，需手动触发
      blendMode: 'ADD' // 叠加混合模式，让粒子更炫
    });

    // 停止自动发射
    this.emitter.stop();

    // 点击敌人触发死亡效果
    this.enemy.on('pointerdown', () => {
      this.triggerEnemyDeath();
    });

    // 添加提示文本
    this.add.text(10, 10, 'Click the yellow enemy to trigger explosion', {
      fontSize: '18px',
      color: '#ffffff'
    });

    // 显示击杀计数
    this.killText = this.add.text(10, 40, 'Kills: 0', {
      fontSize: '20px',
      color: '#ffff00'
    });

    // 添加自动触发按钮（用于测试）
    const autoTriggerButton = this.add.text(10, 70, '[Auto Trigger in 2s]', {
      fontSize: '16px',
      color: '#00ff00'
    }).setInteractive();

    autoTriggerButton.on('pointerdown', () => {
      this.time.delayedCall(2000, () => {
        if (this.enemy && this.enemy.active) {
          this.triggerEnemyDeath();
        }
      });
    });
  }

  triggerEnemyDeath() {
    if (!this.enemy || !this.enemy.active) {
      return;
    }

    // 获取敌人位置
    const x = this.enemy.x;
    const y = this.enemy.y;

    // 移除敌人
    this.enemy.destroy();

    // 在敌人位置触发粒子爆炸
    this.emitter.setPosition(x, y);
    this.emitter.explode(20); // 一次性发射20个粒子

    // 更新击杀计数
    this.killCount++;
    this.killText.setText(`Kills: ${this.killCount}`);

    // 输出状态信息到控制台
    console.log(`Enemy killed! Total kills: ${this.killCount}`);
    console.log(`Particle explosion triggered at (${x}, ${y})`);

    // 4秒后重新生成敌人
    this.time.delayedCall(4500, () => {
      this.respawnEnemy();
    });
  }

  respawnEnemy() {
    // 随机位置重生敌人
    const x = Phaser.Math.Between(100, 700);
    const y = Phaser.Math.Between(100, 500);
    
    this.enemy = this.add.sprite(x, y, 'yellowEnemy');
    this.enemy.setInteractive();
    
    this.enemy.on('pointerdown', () => {
      this.triggerEnemyDeath();
    });

    console.log(`Enemy respawned at (${x}, ${y})`);
  }

  update(time, delta) {
    // 每帧更新逻辑（当前无需特殊处理）
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