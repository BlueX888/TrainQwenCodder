class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemiesChasing = 0; // 状态信号：正在追踪的敌人数量
    this.playerHealth = 100; // 状态信号：玩家生命值
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
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

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 生成 15 个敌人，分布在场景中
    const positions = [
      { x: 100, y: 100 }, { x: 300, y: 100 }, { x: 500, y: 100 },
      { x: 700, y: 100 }, { x: 100, y: 200 }, { x: 300, y: 200 },
      { x: 500, y: 200 }, { x: 700, y: 200 }, { x: 100, y: 400 },
      { x: 300, y: 400 }, { x: 500, y: 400 }, { x: 700, y: 400 },
      { x: 150, y: 500 }, { x: 400, y: 500 }, { x: 650, y: 500 }
    ];

    for (let i = 0; i < 15; i++) {
      const enemy = this.enemies.create(positions[i].x, positions[i].y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 设置敌人的巡逻数据
      enemy.patrolData = {
        startX: positions[i].x,
        minX: positions[i].x - 150, // 巡逻左边界
        maxX: positions[i].x + 150, // 巡逻右边界
        direction: 1, // 1 为向右，-1 为向左
        isChasing: false,
        detectionRange: 200 // 检测玩家的距离
      };
      
      // 设置初始速度
      enemy.setVelocityX(300 * enemy.patrolData.direction);
    }

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 玩家移动控制
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(200);
    }

    // 重置追踪计数
    this.enemiesChasing = 0;

    // 敌人 AI 逻辑
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        enemy.x, enemy.y,
        this.player.x, this.player.y
      );

      // 检测玩家是否在追踪范围内
      if (distance < enemy.patrolData.detectionRange) {
        // 追踪模式
        enemy.patrolData.isChasing = true;
        this.enemiesChasing++;

        // 计算朝向玩家的方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );

        // 设置追踪速度
        this.physics.velocityFromRotation(angle, 300, enemy.body.velocity);

      } else {
        // 巡逻模式
        enemy.patrolData.isChasing = false;

        // 检查是否到达巡逻边界
        if (enemy.x >= enemy.patrolData.maxX) {
          enemy.patrolData.direction = -1;
          enemy.setVelocityX(-300);
        } else if (enemy.x <= enemy.patrolData.minX) {
          enemy.patrolData.direction = 1;
          enemy.setVelocityX(300);
        } else {
          // 保持当前巡逻方向
          enemy.setVelocityX(300 * enemy.patrolData.direction);
        }

        // 保持 Y 轴速度为 0（只左右移动）
        enemy.setVelocityY(0);
      }
    });

    // 更新状态显示
    this.statusText.setText([
      `Health: ${this.playerHealth}`,
      `Enemies Chasing: ${this.enemiesChasing}/15`,
      `Use Arrow Keys to Move`
    ]);
  }

  hitEnemy(player, enemy) {
    // 玩家与敌人碰撞时减少生命值
    this.playerHealth -= 1;
    
    // 敌人反弹
    const angle = Phaser.Math.Angle.Between(
      enemy.x, enemy.y,
      player.x, player.y
    );
    this.physics.velocityFromRotation(angle + Math.PI, 300, enemy.body.velocity);

    // 玩家反弹
    this.physics.velocityFromRotation(angle, 200, player.body.velocity);

    if (this.playerHealth <= 0) {
      this.playerHealth = 0;
      this.scene.restart();
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