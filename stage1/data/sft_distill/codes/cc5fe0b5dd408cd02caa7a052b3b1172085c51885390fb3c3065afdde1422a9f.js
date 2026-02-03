class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0;
    this.gameOver = false;
    this.playerHealth = 100;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(12, 12, 12);
    enemyGraphics.generateTexture('enemy', 24, 24);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 在不同位置创建3个敌人
    const enemyPositions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 400, y: 500 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
    });

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示UI信息
    this.timeText = this.add.text(16, 16, 'Time: 0s', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.healthText = this.add.text(16, 46, 'Health: 100', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ff0000',
      align: 'center'
    }).setOrigin(0.5);

    // 添加说明文本
    this.add.text(400, 580, 'Use Arrow Keys to Move - Avoid Red Enemies!', {
      fontSize: '16px',
      fill: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    // 记录开始时间
    this.startTime = this.time.now;
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新存活时间
    this.survivalTime = Math.floor((time - this.startTime) / 1000);
    this.timeText.setText('Time: ' + this.survivalTime + 's');
    this.healthText.setText('Health: ' + this.playerHealth);

    // 玩家移动控制
    const playerSpeed = 250;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(playerSpeed);
    }

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(playerSpeed);
    }

    // 敌人追踪玩家
    const enemySpeed = 200;
    this.enemies.getChildren().forEach(enemy => {
      // 计算从敌人到玩家的方向向量
      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0) {
        // 归一化方向向量并乘以速度
        const vx = (dx / distance) * enemySpeed;
        const vy = (dy / distance) * enemySpeed;
        enemy.setVelocity(vx, vy);
      }

      // 敌人朝向玩家旋转
      enemy.rotation = Math.atan2(dy, dx);
    });
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) {
      return;
    }

    // 玩家受伤
    this.playerHealth -= 50;
    this.healthText.setText('Health: ' + this.playerHealth);

    // 击退效果
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      player.setVelocity(
        (dx / distance) * 400,
        (dy / distance) * 400
      );
    }

    // 玩家闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2
    });

    // 检查游戏是否结束
    if (this.playerHealth <= 0) {
      this.endGame();
    }
  }

  endGame() {
    this.gameOver = true;
    this.player.setTint(0xff0000);
    this.player.setVelocity(0);
    
    // 停止所有敌人
    this.enemies.getChildren().forEach(enemy => {
      enemy.setVelocity(0);
    });

    // 显示游戏结束信息
    this.statusText.setText('GAME OVER!\nSurvived: ' + this.survivalTime + 's\nClick to Restart');
    
    // 点击重启
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });

    console.log('Game Over - Survival Time:', this.survivalTime, 'seconds');
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