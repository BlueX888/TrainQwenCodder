class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemyStates = []; // 状态信号：记录每个敌人的状态
    this.detectionRange = 200; // 检测范围
    this.patrolSpeed = 160; // 巡逻速度
    this.chaseSpeed = 200; // 追踪速度
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 32, 32);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
  }

  create() {
    // 添加背景提示文字
    this.add.text(10, 10, 'Arrow Keys to Move\nEnemies patrol and chase when near', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建3个敌人，分布在不同位置
    const enemyPositions = [
      { x: 150, y: 150, direction: 1 },
      { x: 400, y: 250, direction: -1 },
      { x: 650, y: 350, direction: 1 }
    ];

    enemyPositions.forEach((pos, index) => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 为每个敌人添加自定义属性
      enemy.patrolDirection = pos.direction; // 巡逻方向：1向右，-1向左
      enemy.isChasing = false; // 是否正在追踪
      enemy.patrolMinX = 50; // 巡逻左边界
      enemy.patrolMaxX = 750; // 巡逻右边界
      
      // 设置初始巡逻速度
      enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);

      // 初始化状态信号
      this.enemyStates[index] = {
        id: index,
        mode: 'patrol',
        direction: pos.direction,
        distanceToPlayer: 0
      };
    });

    // 添加状态显示文本
    this.statusText = this.add.text(10, 560, '', {
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

    // 更新每个敌人的行为
    this.enemies.getChildren().forEach((enemy, index) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        enemy.x,
        enemy.y
      );

      // 更新状态信号
      this.enemyStates[index].distanceToPlayer = Math.floor(distance);

      // 判断是否应该追踪玩家
      if (distance < this.detectionRange) {
        // 进入追踪模式
        if (!enemy.isChasing) {
          enemy.isChasing = true;
          this.enemyStates[index].mode = 'chase';
        }

        // 计算追踪方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x,
          enemy.y,
          this.player.x,
          this.player.y
        );

        // 设置速度指向玩家
        this.physics.velocityFromRotation(angle, this.chaseSpeed, enemy.body.velocity);

      } else {
        // 进入巡逻模式
        if (enemy.isChasing) {
          enemy.isChasing = false;
          this.enemyStates[index].mode = 'patrol';
          // 恢复巡逻速度
          enemy.setVelocity(0);
          enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
        }

        // 巡逻边界检测
        if (enemy.x <= enemy.patrolMinX && enemy.patrolDirection === -1) {
          enemy.patrolDirection = 1;
          enemy.setVelocityX(this.patrolSpeed);
          this.enemyStates[index].direction = 1;
        } else if (enemy.x >= enemy.patrolMaxX && enemy.patrolDirection === 1) {
          enemy.patrolDirection = -1;
          enemy.setVelocityX(-this.patrolSpeed);
          this.enemyStates[index].direction = -1;
        }
      }
    });

    // 更新状态显示
    this.updateStatusDisplay();
  }

  updateStatusDisplay() {
    let statusInfo = 'Enemy States:\n';
    this.enemyStates.forEach((state, index) => {
      statusInfo += `E${state.id}: ${state.mode.toUpperCase()} | `;
      statusInfo += `Dist: ${state.distanceToPlayer} | `;
      statusInfo += `Dir: ${state.direction > 0 ? 'RIGHT' : 'LEFT'}\n`;
    });
    this.statusText.setText(statusInfo);
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