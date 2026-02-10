class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bullet', 10, 10);
    bulletGraphics.destroy();
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      killCount: 0,
      enemiesAlive: 0,
      bulletsFired: 0
    };

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 生成初始敌人
    this.time.addEvent({
      delay: 1000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 初始生成几个敌人
    for (let i = 0; i < 5; i++) {
      this.spawnEnemy();
    }

    // 监听鼠标右键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.shootBullet(pointer);
      }
    });

    // 设置子弹与敌人的碰撞检测
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 显示击杀数文本
    this.killText = this.add.text(16, 16, 'Kills: 0', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    // 显示提示文本
    this.add.text(16, 50, 'Right Click to Shoot', {
      fontSize: '18px',
      fill: '#aaa',
      fontFamily: 'Arial'
    });

    // 键盘控制玩家移动
    this.cursors = this.input.keyboard.createCursorKeys();

    console.log(JSON.stringify({
      event: 'game_start',
      timestamp: Date.now()
    }));
  }

  update() {
    // 玩家移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(200);
    } else {
      this.player.setVelocityY(0);
    }

    // 清理超出屏幕的子弹
    this.bullets.getChildren().forEach((bullet) => {
      if (bullet.active && (bullet.y < -10 || bullet.y > 610 || bullet.x < -10 || bullet.x > 810)) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 更新信号
    window.__signals__.enemiesAlive = this.enemies.getLength();
  }

  spawnEnemy() {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 300);
    
    const enemy = this.enemies.create(x, y, 'enemy');
    enemy.setVelocity(
      Phaser.Math.Between(-50, 50),
      Phaser.Math.Between(-50, 50)
    );
    enemy.setBounce(1);
    enemy.setCollideWorldBounds(true);

    window.__signals__.enemiesAlive = this.enemies.getLength();
  }

  shootBullet(pointer) {
    // 获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y, 'bullet');
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);

      // 计算从玩家到鼠标点击位置的方向
      const angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        pointer.x,
        pointer.y
      );

      // 设置子弹速度
      this.physics.velocityFromRotation(angle, 300, bullet.body.velocity);

      window.__signals__.bulletsFired++;

      console.log(JSON.stringify({
        event: 'bullet_fired',
        position: { x: this.player.x, y: this.player.y },
        target: { x: pointer.x, y: pointer.y },
        timestamp: Date.now()
      }));
    }
  }

  hitEnemy(bullet, enemy) {
    // 子弹消失
    bullet.setActive(false);
    bullet.setVisible(false);

    // 敌人消失
    enemy.destroy();

    // 增加击杀数
    this.killCount++;
    this.killText.setText('Kills: ' + this.killCount);

    // 更新信号
    window.__signals__.killCount = this.killCount;
    window.__signals__.enemiesAlive = this.enemies.getLength();

    console.log(JSON.stringify({
      event: 'enemy_killed',
      killCount: this.killCount,
      enemiesRemaining: this.enemies.getLength(),
      timestamp: Date.now()
    }));
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