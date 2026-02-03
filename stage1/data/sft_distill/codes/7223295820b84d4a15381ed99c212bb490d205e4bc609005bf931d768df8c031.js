class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemiesPatrolling = 8; // 状态信号：巡逻中的敌人数量
    this.enemiesChasing = 0;    // 状态信号：追踪中的敌人数量
    this.playerSpeed = 200;
    this.enemySpeed = 160;
    this.detectionRange = 150;  // 检测范围
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（蓝色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x0000ff, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建8个敌人，分布在不同位置
    const positions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 200, y: 250 },
      { x: 600, y: 250 },
      { x: 200, y: 450 },
      { x: 600, y: 450 }
    ];

    positions.forEach((pos, index) => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 设置初始巡逻方向（奇数向右，偶数向左）
      enemy.patrolDirection = index % 2 === 0 ? 1 : -1;
      enemy.setVelocityX(this.enemySpeed * enemy.patrolDirection);
      
      // 设置巡逻边界
      enemy.patrolMinX = pos.x - 100;
      enemy.patrolMaxX = pos.x + 100;
      
      // 状态标记
      enemy.isChasing = false;
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 570, '使用方向键移动玩家', {
      fontSize: '14px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    // 玩家移动控制
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    }

    // 重置状态计数
    this.enemiesChasing = 0;
    this.enemiesPatrolling = 0;

    // 更新每个敌人的行为
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, 
        this.player.y, 
        enemy.x, 
        enemy.y
      );

      // 判断是否在检测范围内
      if (distance < this.detectionRange) {
        // 追踪模式
        enemy.isChasing = true;
        this.enemiesChasing++;

        // 计算朝向玩家的方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, 
          enemy.y, 
          this.player.x, 
          this.player.y
        );

        // 设置追踪速度
        this.physics.velocityFromRotation(
          angle, 
          this.enemySpeed, 
          enemy.body.velocity
        );
      } else {
        // 巡逻模式
        enemy.isChasing = false;
        this.enemiesPatrolling++;

        // 边界检测，改变巡逻方向
        if (enemy.x <= enemy.patrolMinX) {
          enemy.patrolDirection = 1;
          enemy.setVelocityX(this.enemySpeed * enemy.patrolDirection);
          enemy.setVelocityY(0);
        } else if (enemy.x >= enemy.patrolMaxX) {
          enemy.patrolDirection = -1;
          enemy.setVelocityX(this.enemySpeed * enemy.patrolDirection);
          enemy.setVelocityY(0);
        }

        // 如果之前在追踪，现在返回巡逻，重置Y速度
        if (Math.abs(enemy.body.velocity.y) > 0) {
          enemy.setVelocityY(0);
          enemy.setVelocityX(this.enemySpeed * enemy.patrolDirection);
        }
      }
    });

    // 更新状态显示
    this.statusText.setText([
      `巡逻敌人: ${this.enemiesPatrolling}`,
      `追踪敌人: ${this.enemiesChasing}`,
      `玩家位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`
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