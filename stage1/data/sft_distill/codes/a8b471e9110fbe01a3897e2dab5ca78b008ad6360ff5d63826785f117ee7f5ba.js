class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0;
    this.explosionCount = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建黄色敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffff00, 1); // 黄色
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建粒子纹理（红色小圆点）
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xff6600, 1); // 橙红色
    particleGraphics.fillCircle(4, 4, 4);
    particleGraphics.generateTexture('particle', 8, 8);
    particleGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建多个黄色敌人
    for (let i = 0; i < 5; i++) {
      const enemy = this.enemies.create(
        100 + i * 150,
        100 + Math.sin(i) * 50,
        'enemy'
      );
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(50, 150)
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

    // 创建粒子发射器（初始时停止）
    this.particleEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: 100, max: 300 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 4000, // 持续4秒
      gravityY: 150,
      quantity: 20, // 每次发射20个粒子
      frequency: -1, // 手动触发，不自动发射
      blendMode: 'ADD'
    });

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    // 显示状态信息
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatus();

    // 提示文本
    this.add.text(400, 550, 'Arrow Keys: Move | Space: Kill Enemy', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 玩家移动
    const speed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 空格键测试：杀死最近的敌人
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      const nearestEnemy = this.physics.closest(this.player, this.enemies.getChildren());
      if (nearestEnemy) {
        this.killEnemy(nearestEnemy);
      }
    }
  }

  hitEnemy(player, enemy) {
    // 碰撞时杀死敌人
    this.killEnemy(enemy);
  }

  killEnemy(enemy) {
    // 触发粒子爆炸效果
    this.triggerExplosion(enemy.x, enemy.y);
    
    // 销毁敌人
    enemy.destroy();
    
    // 更新击杀计数
    this.killCount++;
    this.updateStatus();

    // 如果所有敌人都被消灭，重新生成
    if (this.enemies.countActive() === 0) {
      this.time.delayedCall(2000, () => {
        this.respawnEnemies();
      });
    }
  }

  triggerExplosion(x, y) {
    // 在指定位置触发粒子爆炸
    this.particleEmitter.setPosition(x, y);
    this.particleEmitter.explode(20); // 发射20个粒子
    
    // 更新爆炸计数
    this.explosionCount++;
    this.updateStatus();

    // 添加闪光效果
    const flash = this.add.circle(x, y, 30, 0xffff00, 0.8);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2,
      duration: 500,
      onComplete: () => flash.destroy()
    });
  }

  respawnEnemies() {
    // 重新生成敌人
    for (let i = 0; i < 5; i++) {
      const enemy = this.enemies.create(
        100 + i * 150,
        100 + Math.sin(i) * 50,
        'enemy'
      );
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(50, 150)
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }
  }

  updateStatus() {
    this.statusText.setText(
      `Kills: ${this.killCount} | Explosions: ${this.explosionCount} | Enemies: ${this.enemies.countActive()}`
    );
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

new Phaser.Game(config);