class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0;
    this.particleExplosionCount = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建粉色敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff69b4, 1); // 粉色
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('pinkEnemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1); // 绿色
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建粒子纹理（小圆点）
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xff69b4, 1); // 粉色粒子
    particleGraphics.fillCircle(4, 4, 4);
    particleGraphics.generateTexture('particle', 8, 8);
    particleGraphics.destroy();

    // 创建粒子发射器（初始不激活）
    this.particleEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 4000, // 持续4秒
      gravityY: 0,
      quantity: 15, // 每次发射15个粒子
      frequency: -1, // 不自动发射，手动触发
      emitting: false
    });

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建多个粉色敌人
    for (let i = 0; i < 3; i++) {
      const enemy = this.enemies.create(
        150 + i * 250,
        200,
        'pinkEnemy'
      );
      enemy.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-50, 50)
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleEnemyHit,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示说明
    this.add.text(10, 550, '方向键移动，空格键重置 | 撞击粉色敌人触发粒子爆炸', {
      fontSize: '14px',
      color: '#ffff00'
    });

    this.updateStatusText();
  }

  handleEnemyHit(player, enemy) {
    // 触发粒子爆炸
    this.triggerParticleExplosion(enemy.x, enemy.y);
    
    // 销毁敌人
    enemy.destroy();
    
    // 更新计数
    this.killCount++;
    this.updateStatusText();
  }

  triggerParticleExplosion(x, y) {
    // 在指定位置触发粒子爆炸
    this.particleEmitter.setPosition(x, y);
    this.particleEmitter.explode(15); // 发射15个粒子
    
    // 更新爆炸计数
    this.particleExplosionCount++;
    this.updateStatusText();
    
    // 4秒后可以在控制台看到粒子消失
    console.log(`粒子爆炸 #${this.particleExplosionCount} 触发于 (${x}, ${y})`);
  }

  updateStatusText() {
    this.statusText.setText(
      `击杀数: ${this.killCount} | 粒子爆炸次数: ${this.particleExplosionCount} | 剩余敌人: ${this.enemies.getLength()}`
    );
  }

  update() {
    // 玩家移动控制
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

    // 空格键重置场景
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.scene.restart();
    }

    // 更新状态文本（显示存活粒子数）
    const aliveParticles = this.particleEmitter.getAliveParticleCount();
    if (aliveParticles > 0) {
      this.statusText.setText(
        `击杀数: ${this.killCount} | 粒子爆炸次数: ${this.particleExplosionCount} | 剩余敌人: ${this.enemies.getLength()} | 存活粒子: ${aliveParticles}`
      );
    }
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