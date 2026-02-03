class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemiesChasingCount = 0; // 状态信号：正在追踪的敌人数量
    this.playerTouchedCount = 0; // 状态信号：玩家被触碰次数
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（绿色圆形）
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0x00ff00, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
  }

  create() {
    const { width, height } = this.sys.game.config;

    // 创建玩家
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建3个敌人，设置不同初始位置和巡逻方向
    const enemyData = [
      { x: 150, y: 150, direction: 1 },
      { x: 400, y: 300, direction: -1 },
      { x: 650, y: 450, direction: 1 }
    ];

    enemyData.forEach(data => {
      const enemy = this.enemies.create(data.x, data.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 自定义属性
      enemy.patrolDirection = data.direction; // 巡逻方向（1=右，-1=左）
      enemy.isChasing = false; // 是否正在追踪
      enemy.patrolSpeed = 160; // 巡逻速度
      enemy.chaseDistance = 200; // 追踪触发距离
      
      // 设置初始巡逻速度
      enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
    });

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.handlePlayerEnemyCollision, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(10, height - 40, 'Use Arrow Keys to Move', {
      fontSize: '14px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    // 更新玩家移动
    this.updatePlayerMovement();

    // 更新敌人行为
    this.enemiesChasingCount = 0;
    this.enemies.getChildren().forEach(enemy => {
      this.updateEnemyBehavior(enemy);
    });

    // 更新状态显示
    this.statusText.setText(
      `Enemies Chasing: ${this.enemiesChasingCount}\n` +
      `Player Touched: ${this.playerTouchedCount}`
    );
  }

  updatePlayerMovement() {
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
  }

  updateEnemyBehavior(enemy) {
    const { width } = this.sys.game.config;
    const distance = Phaser.Math.Distance.Between(
      enemy.x, enemy.y,
      this.player.x, this.player.y
    );

    // 判断是否应该追踪玩家
    if (distance < enemy.chaseDistance) {
      // 追踪模式
      if (!enemy.isChasing) {
        enemy.isChasing = true;
      }

      // 计算朝向玩家的速度向量
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        this.player.x, this.player.y
      );

      const velocityX = Math.cos(angle) * enemy.patrolSpeed;
      const velocityY = Math.sin(angle) * enemy.patrolSpeed;

      enemy.setVelocity(velocityX, velocityY);
      
      this.enemiesChasingCount++;
    } else {
      // 巡逻模式
      if (enemy.isChasing) {
        enemy.isChasing = false;
        enemy.setVelocityY(0);
        enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
      }

      // 检查是否碰到边界，反转方向
      if (enemy.x <= 16 && enemy.patrolDirection === -1) {
        enemy.patrolDirection = 1;
        enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
      } else if (enemy.x >= width - 16 && enemy.patrolDirection === 1) {
        enemy.patrolDirection = -1;
        enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
      }
    }
  }

  handlePlayerEnemyCollision(player, enemy) {
    // 玩家被敌人触碰
    this.playerTouchedCount++;
    
    // 简单的击退效果
    const angle = Phaser.Math.Angle.Between(
      enemy.x, enemy.y,
      player.x, player.y
    );
    player.setVelocity(
      Math.cos(angle) * 300,
      Math.sin(angle) * 300
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