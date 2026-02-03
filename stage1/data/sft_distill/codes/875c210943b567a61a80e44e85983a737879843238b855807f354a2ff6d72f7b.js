class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.aliveEnemies = 20; // 状态信号：存活敌人数
    this.playerHealth = 100; // 状态信号：玩家生命值
    this.detectionRange = 200; // 检测范围
    this.patrolSpeed = 360; // 巡逻速度
    this.chaseSpeed = 360; // 追踪速度
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0099ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（粉色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff69b4, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group({
      key: 'enemy',
      repeat: 19, // 创建20个敌人
      setXY: { 
        x: 100, 
        y: 100, 
        stepX: 0, 
        stepY: 0 
      }
    });

    // 初始化每个敌人的位置和巡逻数据
    this.enemies.children.entries.forEach((enemy, index) => {
      // 随机分布在场景中
      enemy.x = Phaser.Math.Between(50, 750);
      enemy.y = Phaser.Math.Between(50, 550);
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1, 1);
      
      // 存储巡逻数据
      enemy.patrolDirection = Phaser.Math.Between(0, 1) === 0 ? -1 : 1; // 随机初始方向
      enemy.patrolLeft = enemy.x - 100; // 巡逻左边界
      enemy.patrolRight = enemy.x + 100; // 巡逻右边界
      enemy.isChasing = false;
      
      // 设置初始速度
      enemy.body.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
    });

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.handleCollision, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  update(time, delta) {
    // 玩家移动控制
    const playerSpeed = 300;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(playerSpeed);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-playerSpeed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(playerSpeed);
    }

    // 更新每个敌人的行为
    this.enemies.children.entries.forEach((enemy) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, 
        this.player.y, 
        enemy.x, 
        enemy.y
      );

      // 检测玩家是否在范围内
      if (distance < this.detectionRange) {
        // 追踪模式
        enemy.isChasing = true;
        
        // 计算朝向玩家的方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, 
          enemy.y, 
          this.player.x, 
          this.player.y
        );
        
        // 设置追踪速度
        enemy.body.setVelocity(
          Math.cos(angle) * this.chaseSpeed,
          Math.sin(angle) * this.chaseSpeed
        );
      } else {
        // 巡逻模式
        if (enemy.isChasing) {
          // 从追踪切换回巡逻，重置速度
          enemy.isChasing = false;
          enemy.body.setVelocity(0);
          enemy.body.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
        }
        
        // 巡逻边界检测和反向
        if (enemy.patrolDirection === 1 && enemy.x >= enemy.patrolRight) {
          enemy.patrolDirection = -1;
          enemy.body.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
        } else if (enemy.patrolDirection === -1 && enemy.x <= enemy.patrolLeft) {
          enemy.patrolDirection = 1;
          enemy.body.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
        }
      }
    });

    this.updateStatusText();
  }

  handleCollision(player, enemy) {
    // 碰撞处理：敌人消失，玩家扣血
    enemy.destroy();
    this.aliveEnemies--;
    this.playerHealth -= 10;

    // 创建碰撞特效
    const flash = this.add.circle(enemy.x, enemy.y, 20, 0xffffff, 0.8);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => flash.destroy()
    });

    // 检查游戏结束条件
    if (this.aliveEnemies <= 0) {
      this.showGameOver('Victory! All enemies defeated!');
    } else if (this.playerHealth <= 0) {
      this.showGameOver('Game Over! Player defeated!');
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `Enemies: ${this.aliveEnemies} | Health: ${this.playerHealth}\n` +
      `Use Arrow Keys or WASD to move`
    );
  }

  showGameOver(message) {
    // 停止物理系统
    this.physics.pause();
    
    // 显示游戏结束信息
    const gameOverText = this.add.text(400, 300, message, {
      fontSize: '32px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    gameOverText.setOrigin(0.5);

    // 重启提示
    const restartText = this.add.text(400, 350, 'Click to restart', {
      fontSize: '20px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    restartText.setOrigin(0.5);

    // 点击重启
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
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