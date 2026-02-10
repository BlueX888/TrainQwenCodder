class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.trackingEnemiesCount = 0; // 可验证状态信号
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

    // 创建敌人纹理（黄色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffff00, 1);
    enemyGraphics.fillRect(0, 0, 28, 28);
    enemyGraphics.generateTexture('enemy', 28, 28);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建8个敌人，分布在不同位置
    const enemyPositions = [
      { x: 100, y: 100, minX: 50, maxX: 250 },
      { x: 700, y: 100, minX: 550, maxX: 750 },
      { x: 100, y: 300, minX: 50, maxX: 250 },
      { x: 700, y: 300, minX: 550, maxX: 750 },
      { x: 100, y: 500, minX: 50, maxX: 250 },
      { x: 700, y: 500, minX: 550, maxX: 750 },
      { x: 400, y: 150, minX: 300, maxX: 500 },
      { x: 400, y: 450, minX: 300, maxX: 500 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      
      // 设置巡逻数据
      enemy.setData('patrolMinX', pos.minX);
      enemy.setData('patrolMaxX', pos.maxX);
      enemy.setData('patrolY', pos.y);
      enemy.setData('isTracking', false);
      enemy.setData('patrolDirection', 1); // 1为右，-1为左
      
      // 设置初始巡逻速度
      enemy.setVelocityX(240 * enemy.getData('patrolDirection'));
    });

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 560, 'Use Arrow Keys to Move. Enemies chase when close!', {
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
    this.trackingEnemiesCount = 0;

    // 更新每个敌人的行为
    this.enemies.getChildren().forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );

      const trackingRange = 150; // 追踪范围
      const patrolRange = 200; // 返回巡逻范围

      if (distance < trackingRange) {
        // 进入追踪模式
        if (!enemy.getData('isTracking')) {
          enemy.setData('isTracking', true);
        }

        // 计算追踪方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );

        // 设置追踪速度
        const trackingSpeed = 240;
        enemy.setVelocity(
          Math.cos(angle) * trackingSpeed,
          Math.sin(angle) * trackingSpeed
        );

        this.trackingEnemiesCount++;

      } else if (distance > patrolRange && enemy.getData('isTracking')) {
        // 退出追踪模式，返回巡逻
        enemy.setData('isTracking', false);
      }

      // 巡逻模式
      if (!enemy.getData('isTracking')) {
        const minX = enemy.getData('patrolMinX');
        const maxX = enemy.getData('patrolMaxX');
        const patrolY = enemy.getData('patrolY');
        let direction = enemy.getData('patrolDirection');

        // 检查是否到达边界
        if (enemy.x <= minX) {
          direction = 1;
          enemy.setData('patrolDirection', direction);
        } else if (enemy.x >= maxX) {
          direction = -1;
          enemy.setData('patrolDirection', direction);
        }

        // 设置巡逻速度
        enemy.setVelocity(240 * direction, 0);

        // 保持在巡逻Y轴位置
        if (Math.abs(enemy.y - patrolY) > 5) {
          enemy.y = Phaser.Math.Linear(enemy.y, patrolY, 0.1);
        }
      }
    });

    // 更新状态文本
    this.statusText.setText(
      `Tracking Enemies: ${this.trackingEnemiesCount}/8\n` +
      `Player: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`
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