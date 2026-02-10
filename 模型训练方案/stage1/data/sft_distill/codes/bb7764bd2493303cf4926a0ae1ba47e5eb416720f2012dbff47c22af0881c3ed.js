class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemiesPatrolling = 0; // 状态信号：巡逻中的敌人数量
    this.enemiesChasing = 0; // 状态信号：追踪中的敌人数量
    this.playerSpeed = 200;
    this.enemySpeed = 240;
    this.detectionRange = 150; // 敌人检测玩家的距离
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

    // 创建敌人纹理（黄色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffff00, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

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
      enemy.setBounce(1, 1);
      
      // 为每个敌人设置初始巡逻方向（随机左或右）
      const direction = index % 2 === 0 ? 1 : -1;
      enemy.setVelocityX(this.enemySpeed * direction);
      
      // 自定义属性
      enemy.patrolDirection = direction;
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
    this.add.text(10, 560, 'Arrow Keys to Move | Yellow enemies patrol and chase when near', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
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

    // 重置计数器
    this.enemiesPatrolling = 0;
    this.enemiesChasing = 0;

    // 更新每个敌人的行为
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );

      // 判断是否应该追踪玩家
      if (distance < this.detectionRange) {
        // 追踪模式
        enemy.isChasing = true;
        this.enemiesChasing++;

        // 计算朝向玩家的方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );

        // 设置速度朝向玩家
        enemy.setVelocity(
          Math.cos(angle) * this.enemySpeed,
          Math.sin(angle) * this.enemySpeed
        );

        // 改变颜色表示追踪状态（红色）
        enemy.setTint(0xff0000);
      } else {
        // 巡逻模式
        if (enemy.isChasing) {
          // 从追踪模式切换回巡逻模式
          enemy.isChasing = false;
          enemy.setVelocity(this.enemySpeed * enemy.patrolDirection, 0);
          enemy.clearTint();
        }

        this.enemiesPatrolling++;

        // 检查是否碰到左右边界
        if (enemy.x <= 16 && enemy.body.velocity.x < 0) {
          enemy.patrolDirection = 1;
          enemy.setVelocityX(this.enemySpeed);
        } else if (enemy.x >= 784 && enemy.body.velocity.x > 0) {
          enemy.patrolDirection = -1;
          enemy.setVelocityX(-this.enemySpeed);
        }

        // 保持巡逻速度恒定
        if (Math.abs(enemy.body.velocity.x) < this.enemySpeed - 10) {
          enemy.setVelocityX(this.enemySpeed * enemy.patrolDirection);
        }
        enemy.setVelocityY(0);
      }
    });

    // 更新状态显示
    this.statusText.setText([
      `Patrolling: ${this.enemiesPatrolling}`,
      `Chasing: ${this.enemiesChasing}`,
      `Player: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`
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