class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemiesChasing = 0; // 状态信号：正在追踪的敌人数量
    this.totalEnemies = 20;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（紫色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x9932cc, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 生成20个敌人，分布在场景中
    for (let i = 0; i < this.totalEnemies; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const enemy = this.enemies.create(x, y, 'enemy');
      
      // 设置敌人属性
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1, 1);
      
      // 自定义属性：巡逻模式
      enemy.patrolDirection = Phaser.Math.Between(0, 1) === 0 ? -1 : 1; // -1左，1右
      enemy.patrolSpeed = 200;
      enemy.chaseSpeed = 250;
      enemy.detectionRange = 150; // 检测范围
      enemy.isChasing = false;
      
      // 设置初始巡逻速度
      enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
    }

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 560, '使用方向键移动玩家', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
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

    // 重置追踪计数
    this.enemiesChasing = 0;

    // 更新每个敌人的行为
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );

      // 判断是否进入追踪模式
      if (distance < enemy.detectionRange) {
        enemy.isChasing = true;
        this.enemiesChasing++;

        // 追踪玩家
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );
        
        enemy.setVelocity(
          Math.cos(angle) * enemy.chaseSpeed,
          Math.sin(angle) * enemy.chaseSpeed
        );

        // 改变颜色表示追踪状态（深紫色）
        enemy.setTint(0xff00ff);
      } else {
        // 恢复巡逻模式
        if (enemy.isChasing) {
          enemy.isChasing = false;
          enemy.clearTint();
          enemy.setVelocityY(0);
          enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
        }

        // 巡逻逻辑：碰到边界反向
        if (enemy.x <= 16 && enemy.patrolDirection === -1) {
          enemy.patrolDirection = 1;
          enemy.setVelocityX(enemy.patrolSpeed);
        } else if (enemy.x >= 784 && enemy.patrolDirection === 1) {
          enemy.patrolDirection = -1;
          enemy.setVelocityX(-enemy.patrolSpeed);
        }
      }
    });

    // 更新状态显示
    this.statusText.setText([
      `敌人总数: ${this.totalEnemies}`,
      `正在追踪: ${this.enemiesChasing}`,
      `巡逻中: ${this.totalEnemies - this.enemiesChasing}`
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