class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0; // 状态信号：击杀数量
  }

  preload() {
    // 创建紫色敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x9b59b6, 1); // 紫色
    enemyGraphics.fillCircle(25, 25, 25);
    enemyGraphics.generateTexture('purpleEnemy', 50, 50);
    enemyGraphics.destroy();

    // 创建粒子纹理（小圆点）
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xe74c3c, 1); // 红色粒子
    particleGraphics.fillCircle(4, 4, 4);
    particleGraphics.generateTexture('particle', 8, 8);
    particleGraphics.destroy();
  }

  create() {
    // 添加背景文字说明
    this.add.text(10, 10, 'Click on purple enemies to destroy them', {
      fontSize: '18px',
      color: '#ffffff'
    });

    // 显示击杀数量
    this.killText = this.add.text(10, 40, 'Kills: 0', {
      fontSize: '24px',
      color: '#ffff00'
    });

    // 创建粒子发射器（初始不激活）
    this.particleEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: 100, max: 300 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 3000, // 持续3秒
      gravityY: 50,
      quantity: 10,
      frequency: -1, // 手动触发
      emitting: false
    });

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 生成多个紫色敌人
    const positions = [
      { x: 200, y: 200 },
      { x: 400, y: 300 },
      { x: 600, y: 200 },
      { x: 300, y: 400 },
      { x: 500, y: 450 }
    ];

    positions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'purpleEnemy');
      enemy.setInteractive();
      enemy.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-50, 50)
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);

      // 点击敌人触发死亡
      enemy.on('pointerdown', () => {
        this.killEnemy(enemy);
      });
    });

    // 添加提示文字
    this.add.text(10, 550, 'Enemies move randomly. Click to destroy!', {
      fontSize: '16px',
      color: '#aaaaaa'
    });
  }

  update() {
    // 可以添加额外的更新逻辑
  }

  killEnemy(enemy) {
    if (!enemy.active) return;

    // 获取敌人位置
    const x = enemy.x;
    const y = enemy.y;

    // 触发粒子爆炸效果
    this.particleEmitter.explode(10, x, y);

    // 添加闪光效果
    const flash = this.add.circle(x, y, 30, 0xffffff, 0.8);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => {
        flash.destroy();
      }
    });

    // 销毁敌人
    enemy.destroy();

    // 更新击杀数量
    this.killCount++;
    this.killText.setText(`Kills: ${this.killCount}`);

    // 如果所有敌人都被消灭，显示胜利信息
    if (this.enemies.countActive() === 0) {
      const victoryText = this.add.text(400, 300, 'All Enemies Destroyed!', {
        fontSize: '32px',
        color: '#00ff00',
        stroke: '#000000',
        strokeThickness: 4
      });
      victoryText.setOrigin(0.5);

      // 重新生成敌人
      this.time.delayedCall(2000, () => {
        victoryText.destroy();
        this.respawnEnemies();
      });
    }
  }

  respawnEnemies() {
    const positions = [
      { x: 200, y: 200 },
      { x: 400, y: 300 },
      { x: 600, y: 200 },
      { x: 300, y: 400 },
      { x: 500, y: 450 }
    ];

    positions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'purpleEnemy');
      enemy.setInteractive();
      enemy.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-50, 50)
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);

      enemy.on('pointerdown', () => {
        this.killEnemy(enemy);
      });
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);