class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemiesChasing = 0; // 状态信号：正在追踪的敌人数量
    this.playerSpeed = 250;
    this.enemyPatrolSpeed = 200;
    this.enemyChaseSpeed = 250;
    this.chaseDistance = 150; // 追踪触发距离
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
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
    // 添加背景文字说明
    this.add.text(10, 10, 'WASD/方向键移动玩家\n敌人靠近时会追踪', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 560, '', {
      fontSize: '18px',
      fill: '#00ff00'
    });

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建3个敌人，设置不同的初始位置和巡逻方向
    const enemyData = [
      { x: 150, y: 150, direction: 1, minX: 50, maxX: 350 },
      { x: 650, y: 300, direction: -1, minX: 450, maxX: 750 },
      { x: 400, y: 500, direction: 1, minX: 200, maxX: 600 }
    ];

    enemyData.forEach(data => {
      const enemy = this.enemies.create(data.x, data.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      
      // 自定义属性
      enemy.patrolDirection = data.direction; // 1=右, -1=左
      enemy.minX = data.minX; // 巡逻左边界
      enemy.maxX = data.maxX; // 巡逻右边界
      enemy.isChasing = false; // 是否在追踪状态
      enemy.state = 'patrol'; // 状态：patrol 或 chase
      
      // 设置初始速度
      enemy.setVelocityX(this.enemyPatrolSpeed * enemy.patrolDirection);
    });

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 添加碰撞检测（可选，用于游戏结束等逻辑）
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);
  }

  update(time, delta) {
    // 玩家移动控制
    this.player.setVelocity(0);

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    }

    // 重置追踪计数
    this.enemiesChasing = 0;

    // 更新每个敌人的行为
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );

      // 判断是否应该追踪玩家
      if (distance < this.chaseDistance) {
        // 进入追踪模式
        if (enemy.state !== 'chase') {
          enemy.state = 'chase';
          enemy.isChasing = true;
        }

        this.enemiesChasing++;

        // 计算朝向玩家的方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );

        // 设置追踪速度
        this.physics.velocityFromRotation(
          angle,
          this.enemyChaseSpeed,
          enemy.body.velocity
        );

      } else {
        // 恢复巡逻模式
        if (enemy.state !== 'patrol') {
          enemy.state = 'patrol';
          enemy.isChasing = false;
          enemy.setVelocityY(0);
        }

        // 巡逻逻辑：左右往返
        if (enemy.x <= enemy.minX) {
          enemy.patrolDirection = 1; // 向右
          enemy.setVelocityX(this.enemyPatrolSpeed);
        } else if (enemy.x >= enemy.maxX) {
          enemy.patrolDirection = -1; // 向左
          enemy.setVelocityX(-this.enemyPatrolSpeed);
        } else {
          // 保持当前方向
          enemy.setVelocityX(this.enemyPatrolSpeed * enemy.patrolDirection);
        }
      }
    });

    // 更新状态显示
    this.statusText.setText(
      `追踪中的敌人: ${this.enemiesChasing}/3`
    );
  }

  hitEnemy(player, enemy) {
    // 碰撞处理（可扩展为游戏结束等逻辑）
    // 这里仅作为示例，可以添加生命值减少等
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