class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.trackingEnemiesCount = 0; // 状态信号：正在追踪的敌人数量
    this.totalEnemies = 15; // 状态信号：敌人总数
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（灰色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建15个敌人，随机分布
    for (let i = 0; i < this.totalEnemies; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const enemy = this.enemies.create(x, y, 'enemy');
      
      // 设置敌人属性
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1, 0);
      
      // 自定义属性：巡逻模式
      enemy.patrolDirection = Phaser.Math.Between(0, 1) === 0 ? -1 : 1; // 随机初始方向
      enemy.patrolSpeed = 240;
      enemy.trackingSpeed = 240;
      enemy.detectionRange = 150; // 检测范围
      enemy.isTracking = false; // 是否正在追踪
      
      // 设置初始巡逻边界（左右移动范围）
      enemy.patrolMinX = Math.max(50, x - 150);
      enemy.patrolMaxX = Math.min(750, x + 150);
      
      // 设置初始速度
      enemy.setVelocityX(enemy.patrolDirection * enemy.patrolSpeed);
    }

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加UI文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 570, 'Use Arrow Keys to Move | Enemies track you when close', {
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
    this.trackingEnemiesCount = 0;

    // 更新每个敌人的行为
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, 
        this.player.y, 
        enemy.x, 
        enemy.y
      );

      // 判断是否进入追踪模式
      if (distance < enemy.detectionRange) {
        enemy.isTracking = true;
        this.trackingEnemiesCount++;
        
        // 追踪玩家
        this.physics.moveToObject(enemy, this.player, enemy.trackingSpeed);
      } else {
        // 巡逻模式
        if (enemy.isTracking) {
          // 从追踪模式切换回巡逻模式
          enemy.isTracking = false;
          enemy.setVelocityY(0);
          enemy.setVelocityX(enemy.patrolDirection * enemy.patrolSpeed);
        }

        // 检查巡逻边界，到达边界时反向
        if (enemy.x <= enemy.patrolMinX && enemy.body.velocity.x < 0) {
          enemy.patrolDirection = 1;
          enemy.setVelocityX(enemy.patrolDirection * enemy.patrolSpeed);
        } else if (enemy.x >= enemy.patrolMaxX && enemy.body.velocity.x > 0) {
          enemy.patrolDirection = -1;
          enemy.setVelocityX(enemy.patrolDirection * enemy.patrolSpeed);
        }
      }
    });

    // 更新状态文本
    this.statusText.setText([
      `Total Enemies: ${this.totalEnemies}`,
      `Tracking Enemies: ${this.trackingEnemiesCount}`,
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