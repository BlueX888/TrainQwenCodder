class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemiesChasing = 0; // 状态信号：正在追踪的敌人数量
    this.patrolDistance = 200; // 巡逻距离
    this.chaseDistance = 150; // 追踪触发距离
    this.enemySpeed = 120; // 敌人速度
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

    // 生成敌人纹理（紫色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x9900ff, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 生成5个敌人，分布在不同位置
    const enemyPositions = [
      { x: 150, y: 150 },
      { x: 350, y: 200 },
      { x: 550, y: 150 },
      { x: 250, y: 350 },
      { x: 650, y: 300 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      
      // 存储敌人的初始位置和巡逻状态
      enemy.patrolStartX = pos.x;
      enemy.patrolDirection = 1; // 1 向右，-1 向左
      enemy.isChasing = false;
      
      // 设置初始巡逻速度
      enemy.setVelocityX(this.enemySpeed * enemy.patrolDirection);
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加说明文字
    this.add.text(10, 570, 'Arrow keys to move. Enemies patrol and chase when close.', {
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

        // 计算朝向玩家的方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x,
          enemy.y,
          this.player.x,
          this.player.y
        );

        // 设置速度朝向玩家
        this.physics.velocityFromRotation(
          angle,
          this.enemySpeed,
          enemy.body.velocity
        );

      } else {
        // 巡逻模式
        if (enemy.isChasing) {
          // 从追踪模式切换回巡逻模式，重置速度
          enemy.isChasing = false;
          enemy.setVelocityY(0);
          enemy.setVelocityX(this.enemySpeed * enemy.patrolDirection);
        }

        // 检查巡逻边界
        const distanceFromStart = enemy.x - enemy.patrolStartX;
        
        if (distanceFromStart > this.patrolDistance) {
          // 到达右边界，向左移动
          enemy.patrolDirection = -1;
          enemy.setVelocityX(this.enemySpeed * enemy.patrolDirection);
        } else if (distanceFromStart < -this.patrolDistance) {
          // 到达左边界，向右移动
          enemy.patrolDirection = 1;
          enemy.setVelocityX(this.enemySpeed * enemy.patrolDirection);
        }
      }
    });

    // 更新状态文本
    this.statusText.setText([
      `Enemies Chasing: ${this.enemiesChasing}/5`,
      `Player Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
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