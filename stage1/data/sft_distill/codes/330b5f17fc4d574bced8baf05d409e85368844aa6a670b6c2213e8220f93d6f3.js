class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemiesChasing = 0; // 状态信号：追踪玩家的敌人数量
    this.playerAlive = true; // 状态信号：玩家存活状态
    this.totalEnemies = 20; // 状态信号：敌人总数
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
    // 添加背景色
    this.cameras.main.setBackgroundColor('#2d2d2d');

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(500);
    this.player.setMaxVelocity(200);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 生成20个敌人
    for (let i = 0; i < this.totalEnemies; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const enemy = this.enemies.create(x, y, 'enemy');
      
      // 设置敌人属性
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
      
      // 自定义属性：巡逻数据
      enemy.patrolSpeed = 80;
      enemy.patrolDirection = Phaser.Math.Between(0, 1) === 0 ? -1 : 1; // 随机初始方向
      enemy.patrolMinX = Math.max(50, x - 150);
      enemy.patrolMaxX = Math.min(750, x + 150);
      enemy.isChasing = false;
      enemy.detectionRange = 150; // 检测范围
      enemy.chaseSpeed = 120; // 追踪速度
      
      // 设置初始速度
      enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
    }

    // 添加碰撞检测（玩家与敌人）
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 显示状态信息
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setScrollFactor(0);
    this.statusText.setDepth(100);

    // 添加说明文本
    this.add.text(400, 560, '使用方向键移动 | 黄色敌人会在接近时追踪你', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    if (!this.playerAlive) {
      return;
    }

    // 玩家控制
    const acceleration = 300;
    
    if (this.cursors.left.isDown) {
      this.player.setAccelerationX(-acceleration);
    } else if (this.cursors.right.isDown) {
      this.player.setAccelerationX(acceleration);
    } else {
      this.player.setAccelerationX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setAccelerationY(-acceleration);
    } else if (this.cursors.down.isDown) {
      this.player.setAccelerationY(acceleration);
    } else {
      this.player.setAccelerationY(0);
    }

    // 更新敌人AI
    this.enemiesChasing = 0;
    
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, 
        this.player.y, 
        enemy.x, 
        enemy.y
      );

      // 判断是否应该追踪玩家
      if (distance < enemy.detectionRange) {
        // 追踪模式
        if (!enemy.isChasing) {
          enemy.isChasing = true;
          enemy.setTint(0xff0000); // 变红表示追踪状态
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
          enemy.chaseSpeed, 
          enemy.body.velocity
        );
      } else {
        // 巡逻模式
        if (enemy.isChasing) {
          enemy.isChasing = false;
          enemy.clearTint(); // 恢复黄色
        }

        // 左右巡逻
        if (enemy.x <= enemy.patrolMinX) {
          enemy.patrolDirection = 1;
          enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
          enemy.setVelocityY(0);
        } else if (enemy.x >= enemy.patrolMaxX) {
          enemy.patrolDirection = -1;
          enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
          enemy.setVelocityY(0);
        }
        
        // 保持巡逻速度
        if (Math.abs(enemy.body.velocity.x) < enemy.patrolSpeed - 10) {
          enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
          enemy.setVelocityY(0);
        }
      }
    });

    // 更新状态显示
    this.updateStatus();
  }

  hitEnemy(player, enemy) {
    if (this.playerAlive) {
      this.playerAlive = false;
      player.setTint(0xff0000);
      player.setVelocity(0);
      
      // 停止所有敌人
      this.enemies.children.entries.forEach(e => {
        e.setVelocity(0);
      });

      this.statusText.setText('游戏结束！被敌人抓住了！');
      
      // 3秒后重启
      this.time.delayedCall(3000, () => {
        this.scene.restart();
      });
    }
  }

  updateStatus() {
    const status = [
      `敌人总数: ${this.totalEnemies}`,
      `追踪中: ${this.enemiesChasing}`,
      `玩家状态: ${this.playerAlive ? '存活' : '死亡'}`,
      `位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`
    ];
    
    this.statusText.setText(status.join('\n'));
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