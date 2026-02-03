class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 3; // 玩家生命值
    this.maxHealth = 3;
    this.isInvincible = false; // 无敌状态标志
    this.invincibleDuration = 500; // 无敌时间（毫秒）
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建血量方块纹理（红色小方块）
    const healthGraphics = this.add.graphics();
    healthGraphics.fillStyle(0xff0000, 1);
    healthGraphics.fillRect(0, 0, 30, 30);
    healthGraphics.generateTexture('healthBlock', 30, 30);
    healthGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建3个敌人在不同位置
    const enemyPositions = [
      { x: 200, y: 200 },
      { x: 400, y: 150 },
      { x: 600, y: 250 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    });

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建血量UI
    this.healthDisplay = [];
    this.createHealthDisplay();

    // 添加提示文本
    this.add.text(10, 10, 'Use Arrow Keys to Move', {
      fontSize: '18px',
      color: '#ffffff'
    });

    this.add.text(10, 35, 'Avoid Red Enemies!', {
      fontSize: '18px',
      color: '#ffffff'
    });

    // 状态文本
    this.statusText = this.add.text(10, 560, '', {
      fontSize: '20px',
      color: '#ffff00'
    });
  }

  createHealthDisplay() {
    // 清除旧的血量显示
    this.healthDisplay.forEach(block => block.destroy());
    this.healthDisplay = [];

    // 创建新的血量显示
    for (let i = 0; i < this.health; i++) {
      const healthBlock = this.add.image(700 + i * 35, 30, 'healthBlock');
      this.healthDisplay.push(healthBlock);
    }

    // 添加血量标签
    if (!this.healthLabel) {
      this.healthLabel = this.add.text(620, 15, 'Health:', {
        fontSize: '20px',
        color: '#ffffff'
      });
    }
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，忽略碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣除生命值
    this.health -= 1;
    console.log('Player hit! Health:', this.health);

    // 更新血量显示
    this.createHealthDisplay();

    // 检查是否死亡
    if (this.health <= 0) {
      this.statusText.setText('Game Over! Refresh to restart.');
      this.physics.pause();
      this.player.setTint(0x000000);
      return;
    }

    // 进入无敌状态
    this.isInvincible = true;
    this.statusText.setText('Invincible!');

    // 创建橙色闪烁效果
    this.tweens.add({
      targets: this.player,
      tint: 0xff8800, // 橙色
      duration: 100,
      yoyo: true,
      repeat: 4, // 重复4次，总共0.5秒（100ms * 2 * 5 = 1000ms，但我们只需要0.5秒，所以调整为4次）
      onComplete: () => {
        this.player.clearTint(); // 恢复原色
      }
    });

    // 设置无敌时间结束
    this.time.delayedCall(this.invincibleDuration, () => {
      this.isInvincible = false;
      this.statusText.setText('');
      console.log('Invincibility ended');
    });
  }

  update(time, delta) {
    // 玩家移动控制
    const speed = 200;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }
  }
}

// 游戏配置
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

// 创建游戏实例
const game = new Phaser.Game(config);