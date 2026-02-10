class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemiesPatrolling = 0; // 状态信号：正在巡逻的敌人数
    this.enemiesChasing = 0;    // 状态信号：正在追踪的敌人数
    this.detectionRange = 150;  // 追踪检测范围
    this.patrolSpeed = 80;      // 巡逻速度
    this.chaseSpeed = 120;      // 追踪速度
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（灰色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1);
    enemyGraphics.fillRect(0, 0, 28, 28);
    enemyGraphics.generateTexture('enemy', 28, 28);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 生成15个敌人，分布在场景中
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const enemy = this.enemies.create(x, y, 'enemy');
      
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1, 0); // 水平反弹
      
      // 初始化敌人数据
      enemy.setData('state', 'patrol'); // patrol 或 chase
      enemy.setData('patrolDirection', Phaser.Math.Between(0, 1) ? 1 : -1);
      enemy.setData('minX', x - 100);
      enemy.setData('maxX', x + 100);
      
      // 设置初始巡逻速度
      enemy.setVelocityX(this.patrolSpeed * enemy.getData('patrolDirection'));
    }

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加提示文本
    this.add.text(400, 580, '使用方向键移动玩家', {
      fontSize: '14px',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 玩家控制
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

    // 重置状态计数
    this.enemiesPatrolling = 0;
    this.enemiesChasing = 0;

    // 更新每个敌人的行为
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );

      if (distance < this.detectionRange) {
        // 进入追踪模式
        if (enemy.getData('state') !== 'chase') {
          enemy.setData('state', 'chase');
        }
        
        this.enemiesChasing++;

        // 追踪玩家
        this.physics.moveToObject(enemy, this.player, this.chaseSpeed);
        
      } else {
        // 巡逻模式
        if (enemy.getData('state') !== 'patrol') {
          enemy.setData('state', 'patrol');
          // 恢复巡逻速度
          const direction = enemy.getData('patrolDirection');
          enemy.setVelocity(this.patrolSpeed * direction, 0);
        }
        
        this.enemiesPatrolling++;

        // 检查巡逻边界并反向
        const minX = enemy.getData('minX');
        const maxX = enemy.getData('maxX');
        
        if (enemy.x <= minX || enemy.x >= maxX) {
          const newDirection = -enemy.getData('patrolDirection');
          enemy.setData('patrolDirection', newDirection);
          enemy.setVelocityX(this.patrolSpeed * newDirection);
        }
      }
    });

    // 更新状态显示
    this.statusText.setText([
      `巡逻敌人: ${this.enemiesPatrolling}`,
      `追踪敌人: ${this.enemiesChasing}`,
      `总敌人数: ${this.enemies.children.entries.length}`
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