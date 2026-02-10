class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemyStates = []; // 状态信号：记录每个敌人的状态
    this.chasingCount = 0; // 状态信号：正在追踪的敌人数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
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
    this.enemies = this.physics.add.group();
    
    // 初始化3个敌人，分别在不同位置
    const enemyPositions = [
      { x: 150, y: 150 },
      { x: 400, y: 450 },
      { x: 650, y: 250 }
    ];

    enemyPositions.forEach((pos, index) => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 设置巡逻参数
      enemy.patrolMinX = pos.x - 150;
      enemy.patrolMaxX = pos.x + 150;
      enemy.patrolSpeed = 300;
      enemy.chaseSpeed = 300;
      enemy.detectionRange = 200; // 检测范围
      
      // 初始化巡逻方向（随机左右）
      enemy.setVelocityX(Phaser.Math.Between(0, 1) === 0 ? -300 : 300);
      
      // 初始化状态
      this.enemyStates[index] = 'patrolling';
    });

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 560, '使用方向键移动玩家 | 敌人会在玩家接近时追踪', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  update(time, delta) {
    // 玩家移动控制
    const playerSpeed = 200;
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

    // 更新敌人行为
    this.chasingCount = 0;
    this.enemies.children.entries.forEach((enemy, index) => {
      const distanceToPlayer = Phaser.Math.Distance.Between(
        enemy.x, enemy.y,
        this.player.x, this.player.y
      );

      // 判断是否应该追踪玩家
      if (distanceToPlayer < enemy.detectionRange) {
        // 追踪模式
        this.enemyStates[index] = 'chasing';
        this.chasingCount++;

        // 计算朝向玩家的方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );

        // 设置速度朝向玩家
        this.physics.velocityFromRotation(
          angle,
          enemy.chaseSpeed,
          enemy.body.velocity
        );

        // 设置敌人颜色变化（追踪时变红）
        enemy.setTint(0xff0000);
      } else {
        // 巡逻模式
        this.enemyStates[index] = 'patrolling';
        enemy.clearTint();

        // 检查是否到达巡逻边界
        if (enemy.x <= enemy.patrolMinX && enemy.body.velocity.x < 0) {
          enemy.setVelocityX(enemy.patrolSpeed);
        } else if (enemy.x >= enemy.patrolMaxX && enemy.body.velocity.x > 0) {
          enemy.setVelocityX(-enemy.patrolSpeed);
        }

        // 保持Y轴速度为0（水平巡逻）
        enemy.setVelocityY(0);
      }
    });

    // 更新状态显示
    this.statusText.setText([
      `Enemy States: ${this.enemyStates.join(', ')}`,
      `Chasing Count: ${this.chasingCount}/3`,
      `Player Position: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`
    ]);
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