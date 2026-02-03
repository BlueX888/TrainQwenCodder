class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.patrolSpeed = 240;
    this.chaseSpeed = 300;
    this.chaseDistance = 150;
    this.enemiesChasing = 0; // 状态信号：正在追踪的敌人数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 生成敌人纹理（灰色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建 15 个敌人，随机分布
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const enemy = this.enemies.create(x, y, 'enemy');
      
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 随机初始方向（左或右）
      const direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
      enemy.setVelocityX(direction * this.patrolSpeed);
      
      // 存储敌人状态
      enemy.setData('isChasing', false);
      enemy.setData('patrolDirection', direction);
    }

    // 添加文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 560, 'Arrow keys to move. Enemies chase when you get close!', {
      fontSize: '14px',
      fill: '#ffff00'
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
        if (!enemy.getData('isChasing')) {
          enemy.setData('isChasing', true);
        }

        // 计算追踪方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x,
          enemy.y,
          this.player.x,
          this.player.y
        );

        // 设置追踪速度
        this.physics.velocityFromRotation(angle, this.chaseSpeed, enemy.body.velocity);
        
        this.enemiesChasing++;

        // 改变颜色表示追踪状态（红色）
        enemy.setTint(0xff0000);
      } else {
        // 巡逻模式
        if (enemy.getData('isChasing')) {
          enemy.setData('isChasing', false);
          // 恢复巡逻速度
          const direction = enemy.getData('patrolDirection');
          enemy.setVelocity(direction * this.patrolSpeed, 0);
        }

        // 恢复灰色
        enemy.clearTint();

        // 检测是否碰到左右边界，反向移动
        if (enemy.x <= 16 && enemy.body.velocity.x < 0) {
          enemy.setVelocityX(this.patrolSpeed);
          enemy.setData('patrolDirection', 1);
        } else if (enemy.x >= 784 && enemy.body.velocity.x > 0) {
          enemy.setVelocityX(-this.patrolSpeed);
          enemy.setData('patrolDirection', -1);
        }
      }
    });

    // 更新状态文本
    this.statusText.setText(
      `Enemies: 15 | Chasing: ${this.enemiesChasing} | Player: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
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