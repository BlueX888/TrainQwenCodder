class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0;
    this.killText = null;
    this.player = null;
    this.enemies = null;
    this.bullets = null;
  }

  preload() {
    // 创建玩家纹理（绿色三角形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(16, 0);
    playerGraphics.lineTo(0, 32);
    playerGraphics.lineTo(32, 32);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 初始生成5个敌人
    for (let i = 0; i < 5; i++) {
      this.spawnEnemy();
    }

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 设置碰撞检测：子弹与敌人
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 监听鼠标右键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.shootBullet();
      }
    });

    // 显示击杀数
    this.killText = this.add.text(16, 16, 'Kills: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 键盘控制玩家移动
    this.cursors = this.input.keyboard.createCursorKeys();

    // 定时生成新敌人
    this.time.addEvent({
      delay: 2000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });
  }

  update(time, delta) {
    // 玩家移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active && bullet.y < -10) {
        bullet.destroy();
      }
    });

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.active && enemy.y > 610) {
        enemy.destroy();
      }
    });
  }

  spawnEnemy() {
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, 50, 'enemy');
    enemy.setVelocityY(Phaser.Math.Between(50, 100));
  }

  shootBullet() {
    const bullet = this.bullets.create(
      this.player.x,
      this.player.y - 20,
      'bullet'
    );
    
    if (bullet) {
      bullet.setVelocityY(-160);
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.destroy();
    enemy.destroy();
    
    // 增加击杀数
    this.killCount++;
    this.killText.setText('Kills: ' + this.killCount);
    
    // 生成新敌人
    this.spawnEnemy();
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);