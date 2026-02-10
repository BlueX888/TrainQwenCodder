class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemiesChasing = 0; // 状态信号：正在追踪的敌人数量
    this.totalEnemies = 10;
    this.patrolSpeed = 120;
    this.chaseDistance = 150; // 追踪触发距离
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（白色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffffff, 1);
    enemyGraphics.fillRect(0, 0, 28, 28);
    enemyGraphics.generateTexture('enemy', 28, 28);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 生成10个敌人
    for (let i = 0; i < this.totalEnemies; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const enemy = this.enemies.create(x, y, 'enemy');
      
      // 设置敌人属性
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 自定义属性：巡逻方向和状态
      enemy.patrolDirection = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
      enemy.isChasing = false;
      
      // 设置初始巡逻速度
      enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
    }

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加说明文本
    this.add.text(10, 570, 'Arrow keys to move. Green = Player, White = Enemies', {
      fontSize: '14px',
      fill: '#cccccc'
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

    // 更新每个敌人的行为
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        enemy.x,
        enemy.y
      );

      // 判断是否应该追踪玩家
      if (distance < this.chaseDistance) {
        // 追踪模式
        enemy.isChasing = true;
        this.enemiesChasing++;

        // 计算追踪方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x,
          enemy.y,
          this.player.x,
          this.player.y
        );

        // 设置追踪速度（略快于巡逻速度）
        const chaseSpeed = this.patrolSpeed * 1.2;
        enemy.setVelocity(
          Math.cos(angle) * chaseSpeed,
          Math.sin(angle) * chaseSpeed
        );

        // 改变颜色表示追踪状态（淡红色）
        enemy.setTint(0xffcccc);
      } else {
        // 巡逻模式
        if (enemy.isChasing) {
          // 从追踪模式切换回巡逻模式
          enemy.isChasing = false;
          enemy.setVelocity(this.patrolSpeed * enemy.patrolDirection, 0);
          enemy.clearTint();
        }

        // 检查边界碰撞，改变巡逻方向
        if (enemy.x <= 14 && enemy.body.velocity.x < 0) {
          enemy.patrolDirection = 1;
          enemy.setVelocityX(this.patrolSpeed);
        } else if (enemy.x >= 786 && enemy.body.velocity.x > 0) {
          enemy.patrolDirection = -1;
          enemy.setVelocityX(-this.patrolSpeed);
        }

        // 如果不在追踪状态，确保只有水平速度
        if (!enemy.isChasing) {
          enemy.setVelocityY(0);
        }
      }
    });

    // 更新状态显示
    this.statusText.setText([
      `Enemies Chasing: ${this.enemiesChasing}/${this.totalEnemies}`,
      `Player Position: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`
    ]);
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

// 启动游戏
new Phaser.Game(config);