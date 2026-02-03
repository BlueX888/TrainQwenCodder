class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.detectionRange = 150; // 检测范围
    this.patrolSpeed = 200; // 巡逻速度
    this.chaseSpeed = 250; // 追踪速度
    this.enemiesChasing = 0; // 状态信号：正在追踪的敌人数量
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（紫色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x9933ff, 1);
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

    // 创建20个敌人，随机分布
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const enemy = this.enemies.create(x, y, 'enemy');
      
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1, 1);
      
      // 设置初始巡逻方向（随机左或右）
      const direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
      enemy.setVelocityX(this.patrolSpeed * direction);
      
      // 自定义属性
      enemy.setData('mode', 'patrol'); // patrol 或 chase
      enemy.setData('patrolDirection', direction);
      enemy.setData('patrolMinX', x - 100);
      enemy.setData('patrolMaxX', x + 100);
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
  }

  update(time, delta) {
    // 玩家移动
    const speed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 重置追踪计数
    this.enemiesChasing = 0;

    // 更新每个敌人的行为
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );

      // 检测是否在追踪范围内
      if (distance < this.detectionRange) {
        // 切换到追踪模式
        if (enemy.getData('mode') !== 'chase') {
          enemy.setData('mode', 'chase');
        }
        
        this.enemiesChasing++;

        // 计算追踪方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );

        // 设置追踪速度
        enemy.setVelocity(
          Math.cos(angle) * this.chaseSpeed,
          Math.sin(angle) * this.chaseSpeed
        );

        // 改变颜色表示追踪状态（红色）
        enemy.setTint(0xff0000);
      } else {
        // 切换回巡逻模式
        if (enemy.getData('mode') !== 'patrol') {
          enemy.setData('mode', 'patrol');
          enemy.clearTint();
        }

        // 巡逻逻辑：左右往返
        const patrolMinX = enemy.getData('patrolMinX');
        const patrolMaxX = enemy.getData('patrolMaxX');
        let direction = enemy.getData('patrolDirection');

        // 边界检测，反转方向
        if (enemy.x <= patrolMinX && direction === -1) {
          direction = 1;
          enemy.setData('patrolDirection', direction);
        } else if (enemy.x >= patrolMaxX && direction === 1) {
          direction = -1;
          enemy.setData('patrolDirection', direction);
        }

        // 设置巡逻速度
        enemy.setVelocityX(this.patrolSpeed * direction);
        enemy.setVelocityY(0);
      }
    });

    // 更新状态显示
    this.statusText.setText(
      `玩家位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})\n` +
      `追踪中的敌人: ${this.enemiesChasing} / 20\n` +
      `使用方向键移动玩家`
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