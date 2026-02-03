class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.detectionRange = 150; // 检测范围
    this.patrolSpeed = 160; // 巡逻速度
    this.chaseSpeed = 200; // 追踪速度
    this.enemiesChasing = 0; // 状态信号：正在追踪的敌人数量
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（灰色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1);
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

    // 创建3个敌人，分布在不同位置
    const enemyPositions = [
      { x: 150, y: 150, direction: 1 },
      { x: 400, y: 450, direction: -1 },
      { x: 650, y: 250, direction: 1 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 自定义属性
      enemy.patrolDirection = pos.direction; // 1为向右，-1为向左
      enemy.isChasing = false; // 是否在追踪状态
      enemy.patrolMinX = 100; // 巡逻左边界
      enemy.patrolMaxX = 700; // 巡逻右边界
      
      // 设置初始速度
      enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D');

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 550, 'WASD/方向键移动 | 灰色敌人接近时会追踪玩家', {
      fontSize: '14px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    // 玩家移动
    const playerSpeed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown || this.keys.A.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown || this.keys.D.isDown) {
      this.player.setVelocityX(playerSpeed);
    }

    if (this.cursors.up.isDown || this.keys.W.isDown) {
      this.player.setVelocityY(-playerSpeed);
    } else if (this.cursors.down.isDown || this.keys.S.isDown) {
      this.player.setVelocityY(playerSpeed);
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

      // 判断是否进入追踪范围
      if (distance < this.detectionRange) {
        // 追踪模式
        if (!enemy.isChasing) {
          enemy.isChasing = true;
        }
        
        this.enemiesChasing++;

        // 计算追踪方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, 
          enemy.y, 
          this.player.x, 
          this.player.y
        );
        
        this.physics.velocityFromRotation(
          angle, 
          this.chaseSpeed, 
          enemy.body.velocity
        );

        // 改变敌人颜色表示追踪状态（红色）
        enemy.setTint(0xff6666);
      } else {
        // 巡逻模式
        if (enemy.isChasing) {
          enemy.isChasing = false;
          enemy.setVelocityY(0);
          enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
        }

        // 恢复灰色
        enemy.clearTint();

        // 检测边界并反转方向
        if (enemy.x <= enemy.patrolMinX && enemy.patrolDirection === -1) {
          enemy.patrolDirection = 1;
          enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
        } else if (enemy.x >= enemy.patrolMaxX && enemy.patrolDirection === 1) {
          enemy.patrolDirection = -1;
          enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
        }
      }
    });

    // 更新状态显示
    this.statusText.setText([
      `玩家位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      `追踪中的敌人: ${this.enemiesChasing}/3`,
      `检测范围: ${this.detectionRange}px`
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