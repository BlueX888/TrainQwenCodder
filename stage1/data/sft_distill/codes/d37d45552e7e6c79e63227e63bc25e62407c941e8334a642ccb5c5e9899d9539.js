class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.gameState = {
      enemiesPatrolling: 3,
      enemiesChasing: 0,
      playerHealth: 100
    };
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（黄色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffff00, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建3个敌人，设置初始位置和巡逻范围
    const enemyData = [
      { x: 150, y: 150, minX: 50, maxX: 350 },
      { x: 400, y: 250, minX: 250, maxX: 550 },
      { x: 650, y: 350, minX: 500, maxX: 750 }
    ];

    enemyData.forEach(data => {
      const enemy = this.enemies.create(data.x, data.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      
      // 存储敌人的巡逻数据
      enemy.patrolMinX = data.minX;
      enemy.patrolMaxX = data.maxX;
      enemy.patrolSpeed = 200;
      enemy.chaseSpeed = 250;
      enemy.detectionRange = 150;
      enemy.isChasing = false;
      
      // 初始向右移动
      enemy.setVelocityX(enemy.patrolSpeed);
    });

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 560, '使用方向键移动玩家', {
      fontSize: '14px',
      fill: '#ffffff'
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

    // 重置追踪计数
    let chasingCount = 0;

    // 更新每个敌人的行为
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        enemy.x,
        enemy.y
      );

      // 判断是否应该追踪玩家
      if (distance < enemy.detectionRange) {
        // 追踪模式
        if (!enemy.isChasing) {
          enemy.isChasing = true;
        }
        chasingCount++;

        // 计算朝向玩家的方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x,
          enemy.y,
          this.player.x,
          this.player.y
        );

        // 设置速度朝向玩家
        this.physics.velocityFromRotation(
          angle,
          enemy.chaseSpeed,
          enemy.body.velocity
        );

      } else {
        // 巡逻模式
        if (enemy.isChasing) {
          enemy.isChasing = false;
          // 恢复水平巡逻
          enemy.setVelocityY(0);
          enemy.setVelocityX(enemy.body.velocity.x > 0 ? enemy.patrolSpeed : -enemy.patrolSpeed);
        }

        // 巡逻边界检测和反向
        if (enemy.x <= enemy.patrolMinX && enemy.body.velocity.x < 0) {
          enemy.setVelocityX(enemy.patrolSpeed);
        } else if (enemy.x >= enemy.patrolMaxX && enemy.body.velocity.x > 0) {
          enemy.setVelocityX(-enemy.patrolSpeed);
        }
      }
    });

    // 更新游戏状态
    this.gameState.enemiesChasing = chasingCount;
    this.gameState.enemiesPatrolling = 3 - chasingCount;

    // 更新状态显示
    this.statusText.setText([
      `巡逻敌人: ${this.gameState.enemiesPatrolling}`,
      `追踪敌人: ${this.gameState.enemiesChasing}`,
      `玩家生命: ${this.gameState.playerHealth}`
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