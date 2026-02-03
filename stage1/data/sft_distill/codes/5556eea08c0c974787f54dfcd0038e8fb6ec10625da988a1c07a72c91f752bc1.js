class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.trackingCount = 0; // 状态信号：正在追踪的敌人数量
    this.detectionRange = 150; // 检测范围
    this.patrolSpeed = 80; // 巡逻速度
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
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建5个敌人，分布在不同位置
    const enemyPositions = [
      { x: 150, y: 150, minX: 50, maxX: 250 },
      { x: 400, y: 150, minX: 300, maxX: 500 },
      { x: 650, y: 150, minX: 550, maxX: 750 },
      { x: 250, y: 300, minX: 100, maxX: 400 },
      { x: 550, y: 300, minX: 450, maxX: 700 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      
      // 自定义属性：巡逻范围和状态
      enemy.patrolMinX = pos.minX;
      enemy.patrolMaxX = pos.maxX;
      enemy.patrolDirection = 1; // 1为右，-1为左
      enemy.isTracking = false;
      
      // 设置初始速度
      enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.enemies);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
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

    // 更新追踪计数
    this.trackingCount = 0;

    // 敌人AI逻辑
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, 
        this.player.y, 
        enemy.x, 
        enemy.y
      );

      // 检测是否应该追踪玩家
      if (distance < this.detectionRange) {
        // 追踪模式
        enemy.isTracking = true;
        this.trackingCount++;

        // 计算朝向玩家的方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, 
          enemy.y, 
          this.player.x, 
          this.player.y
        );

        // 设置速度朝向玩家
        enemy.setVelocity(
          Math.cos(angle) * this.patrolSpeed,
          Math.sin(angle) * this.patrolSpeed
        );
      } else {
        // 巡逻模式
        if (enemy.isTracking) {
          // 从追踪切换回巡逻，重置Y速度
          enemy.setVelocityY(0);
          enemy.isTracking = false;
        }

        // 检查是否到达巡逻边界
        if (enemy.x <= enemy.patrolMinX) {
          enemy.patrolDirection = 1; // 向右
          enemy.setVelocityX(this.patrolSpeed);
        } else if (enemy.x >= enemy.patrolMaxX) {
          enemy.patrolDirection = -1; // 向左
          enemy.setVelocityX(-this.patrolSpeed);
        }

        // 保持当前巡逻方向的速度
        if (enemy.body.velocity.x === 0) {
          enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
        }
      }
    });

    // 更新状态文本
    this.statusText.setText(
      `Tracking Enemies: ${this.trackingCount}/5\n` +
      `Player: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})\n` +
      `Detection Range: ${this.detectionRange}px`
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