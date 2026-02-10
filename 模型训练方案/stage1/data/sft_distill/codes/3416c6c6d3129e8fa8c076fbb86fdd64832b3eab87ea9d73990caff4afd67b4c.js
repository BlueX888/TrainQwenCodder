class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemiesChasing = 0; // 状态信号：追踪玩家的敌人数量
    this.totalEnemies = 15;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家纹理（绿色圆形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(20, 20, 20);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 生成15个敌人，分布在不同位置
    for (let i = 0; i < this.totalEnemies; i++) {
      const x = 100 + (i % 5) * 150;
      const y = 100 + Math.floor(i / 5) * 150;
      const enemy = this.enemies.create(x, y, 'enemy');
      
      // 设置敌人属性
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 自定义属性：巡逻范围和状态
      enemy.patrolStartX = x - 100;
      enemy.patrolEndX = x + 100;
      enemy.isChasing = false;
      enemy.patrolDirection = 1; // 1向右，-1向左
      
      // 设置初始巡逻速度
      enemy.body.setVelocityX(160 * enemy.patrolDirection);
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
    // 重置追踪计数
    this.enemiesChasing = 0;

    // 玩家移动
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

    // 敌人AI逻辑
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        enemy.x, enemy.y,
        this.player.x, this.player.y
      );

      const chaseDistance = 150; // 追踪触发距离

      if (distance < chaseDistance) {
        // 追踪模式
        enemy.isChasing = true;
        this.enemiesChasing++;

        // 计算追踪方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );

        // 设置追踪速度（速度160）
        const velocityX = Math.cos(angle) * 160;
        const velocityY = Math.sin(angle) * 160;
        enemy.setVelocity(velocityX, velocityY);

        // 改变颜色表示追踪状态（变为橙色）
        enemy.setTint(0xff6600);
      } else {
        // 巡逻模式
        if (enemy.isChasing) {
          // 从追踪切换回巡逻，恢复颜色
          enemy.clearTint();
          enemy.isChasing = false;
          enemy.setVelocityY(0);
          enemy.setVelocityX(160 * enemy.patrolDirection);
        }

        // 检查是否到达巡逻边界
        if (enemy.x <= enemy.patrolStartX && enemy.patrolDirection === -1) {
          enemy.patrolDirection = 1;
          enemy.setVelocityX(160);
        } else if (enemy.x >= enemy.patrolEndX && enemy.patrolDirection === 1) {
          enemy.patrolDirection = -1;
          enemy.setVelocityX(-160);
        }
      }
    });

    // 更新状态显示
    this.statusText.setText(
      `敌人总数: ${this.totalEnemies}\n` +
      `追踪中: ${this.enemiesChasing}\n` +
      `巡逻中: ${this.totalEnemies - this.enemiesChasing}`
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