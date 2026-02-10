class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.trackingEnemiesCount = 0; // 状态信号：正在追踪的敌人数量
  }

  preload() {
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
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建10个敌人
    for (let i = 0; i < 10; i++) {
      const x = 100 + (i % 5) * 150;
      const y = 100 + Math.floor(i / 5) * 300;
      const enemy = this.enemies.create(x, y, 'enemy');
      
      // 为每个敌人添加自定义属性
      enemy.patrolSpeed = 120;
      enemy.chaseSpeed = 180;
      enemy.detectionRange = 150;
      enemy.isChasing = false;
      
      // 设置巡逻边界和方向
      enemy.patrolLeft = x - 100;
      enemy.patrolRight = x + 100;
      enemy.patrolDirection = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
      
      // 设置初始速度
      enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
    }

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边界
    this.physics.world.setBounds(0, 0, 800, 600);
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
    this.trackingEnemiesCount = 0;

    // 更新每个敌人的行为
    this.enemies.children.entries.forEach(enemy => {
      const distanceToPlayer = Phaser.Math.Distance.Between(
        enemy.x, enemy.y,
        this.player.x, this.player.y
      );

      // 判断是否应该追踪玩家
      if (distanceToPlayer < enemy.detectionRange) {
        enemy.isChasing = true;
        this.trackingEnemiesCount++;
        
        // 追踪模式：朝玩家方向移动
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );
        
        this.physics.velocityFromRotation(
          angle,
          enemy.chaseSpeed,
          enemy.body.velocity
        );
        
        // 设置敌人颜色为红色表示追踪状态
        enemy.setTint(0xff0000);
        
      } else {
        enemy.isChasing = false;
        
        // 巡逻模式：左右往返
        if (enemy.x <= enemy.patrolLeft) {
          enemy.patrolDirection = 1;
          enemy.setVelocityX(enemy.patrolSpeed);
        } else if (enemy.x >= enemy.patrolRight) {
          enemy.patrolDirection = -1;
          enemy.setVelocityX(-enemy.patrolSpeed);
        } else {
          enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
        }
        
        enemy.setVelocityY(0);
        
        // 恢复黄色
        enemy.clearTint();
      }
    });

    // 更新状态文本
    this.statusText.setText([
      `追踪中的敌人: ${this.trackingEnemiesCount}/10`,
      `玩家位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      `使用方向键移动玩家`
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