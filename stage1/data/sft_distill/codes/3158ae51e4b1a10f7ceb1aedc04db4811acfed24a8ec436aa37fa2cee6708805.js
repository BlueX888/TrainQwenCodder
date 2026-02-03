class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerHealth = 100;
    this.isShaking = false;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 28, 28);
    enemyGraphics.generateTexture('enemy', 28, 28);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 生成多个敌人
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
      
      // 给每个敌人设置随机速度
      const velocityX = Phaser.Math.Between(-100, 100);
      const velocityY = Phaser.Math.Between(-100, 100);
      enemy.setVelocity(velocityX, velocityY);
    }

    // 添加碰撞检测
    this.physics.add.collider(
      this.player, 
      this.enemies, 
      this.handleCollision, 
      null, 
      this
    );

    // 敌人之间的碰撞
    this.physics.add.collider(this.enemies, this.enemies);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建生命值显示文本
    this.healthText = this.add.text(16, 16, `Health: ${this.playerHealth}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.healthText.setScrollFactor(0); // 固定在镜头上

    // 创建提示文本
    this.infoText = this.add.text(16, 50, 'Use Arrow Keys to Move', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.infoText.setScrollFactor(0);

    // 设置镜头追踪玩家
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);

    // 设置世界边界
    this.physics.world.setBounds(0, 0, 800, 600);

    // 添加背景网格用于观察震屏效果
    this.createBackgroundGrid();

    // 状态信号（用于验证）
    this.collisionCount = 0;
  }

  createBackgroundGrid() {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);
    
    // 绘制网格
    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y <= 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }
  }

  handleCollision(player, enemy) {
    // 避免在震屏期间重复触发
    if (this.isShaking) {
      return;
    }

    // 扣减生命值
    this.playerHealth -= 10;
    this.playerHealth = Math.max(0, this.playerHealth);
    
    // 更新生命值显示
    this.healthText.setText(`Health: ${this.playerHealth}`);
    
    // 更新碰撞计数（状态信号）
    this.collisionCount++;

    // 触发镜头震动 0.5 秒
    this.isShaking = true;
    this.cameras.main.shake(500, 0.01); // 500ms = 0.5秒，震动强度0.01

    // 震动结束后重置标志
    this.time.delayedCall(500, () => {
      this.isShaking = false;
    });

    // 玩家受击反馈：短暂变色
    player.setTint(0xff0000);
    this.time.delayedCall(200, () => {
      player.clearTint();
    });

    // 击退效果
    const angle = Phaser.Math.Angle.Between(
      enemy.x, enemy.y, 
      player.x, player.y
    );
    player.setVelocity(
      Math.cos(angle) * 200,
      Math.sin(angle) * 200
    );

    // 游戏结束检测
    if (this.playerHealth <= 0) {
      this.gameOver();
    }

    // 输出状态信号到控制台
    console.log(`Collision #${this.collisionCount}: Health = ${this.playerHealth}`);
  }

  gameOver() {
    // 停止物理系统
    this.physics.pause();
    
    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setScrollFactor(0);

    // 重启提示
    const restartText = this.add.text(400, 350, 'Refresh to Restart', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    restartText.setOrigin(0.5);
    restartText.setScrollFactor(0);

    console.log('Game Over! Total collisions:', this.collisionCount);
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

    // 敌人简单 AI：随机改变方向
    this.enemies.children.entries.forEach(enemy => {
      if (Phaser.Math.Between(0, 100) < 2) { // 2% 概率改变方向
        const newVelocityX = Phaser.Math.Between(-100, 100);
        const newVelocityY = Phaser.Math.Between(-100, 100);
        enemy.setVelocity(newVelocityX, newVelocityY);
      }
    });
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