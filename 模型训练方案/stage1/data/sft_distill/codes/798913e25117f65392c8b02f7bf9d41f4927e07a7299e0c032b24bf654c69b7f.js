class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentState = 'idle'; // 可验证的状态变量
  }

  preload() {
    // 创建青色角色的 idle 姿态纹理（站立）
    const idleGraphics = this.add.graphics();
    idleGraphics.fillStyle(0x00FFFF, 1); // 青色
    idleGraphics.fillRect(0, 0, 60, 80); // 身体
    idleGraphics.fillStyle(0x00CCCC, 1); // 深一点的青色
    idleGraphics.fillCircle(30, 20, 20); // 头部
    idleGraphics.fillRect(10, 35, 15, 30); // 左臂
    idleGraphics.fillRect(35, 35, 15, 30); // 右臂
    idleGraphics.generateTexture('player_idle', 60, 80);
    idleGraphics.destroy();

    // 创建青色角色的 run 姿态纹理1（左脚前）
    const run1Graphics = this.add.graphics();
    run1Graphics.fillStyle(0x00FFFF, 1);
    run1Graphics.fillRect(0, 0, 60, 80);
    run1Graphics.fillStyle(0x00CCCC, 1);
    run1Graphics.fillCircle(30, 20, 20);
    run1Graphics.fillRect(5, 30, 15, 35); // 左臂向前
    run1Graphics.fillRect(40, 40, 15, 25); // 右臂向后
    run1Graphics.fillStyle(0x00AAAA, 1);
    run1Graphics.fillRect(15, 70, 12, 10); // 左脚前
    run1Graphics.fillRect(35, 75, 12, 5); // 右脚后
    run1Graphics.generateTexture('player_run1', 60, 80);
    run1Graphics.destroy();

    // 创建青色角色的 run 姿态纹理2（右脚前）
    const run2Graphics = this.add.graphics();
    run2Graphics.fillStyle(0x00FFFF, 1);
    run2Graphics.fillRect(0, 0, 60, 80);
    run2Graphics.fillStyle(0x00CCCC, 1);
    run2Graphics.fillCircle(30, 20, 20);
    run2Graphics.fillRect(40, 30, 15, 35); // 右臂向前
    run2Graphics.fillRect(5, 40, 15, 25); // 左臂向后
    run2Graphics.fillStyle(0x00AAAA, 1);
    run2Graphics.fillRect(35, 70, 12, 10); // 右脚前
    run2Graphics.fillRect(15, 75, 12, 5); // 左脚后
    run2Graphics.generateTexture('player_run2', 60, 80);
    run2Graphics.destroy();
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建角色精灵
    this.player = this.add.sprite(400, 300, 'player_idle');
    this.player.setScale(1.5);

    // 创建 idle 动画（单帧，配合 tween）
    this.anims.create({
      key: 'idle',
      frames: [{ key: 'player_idle' }],
      frameRate: 1
    });

    // 创建 run 动画（多帧快速切换）
    this.anims.create({
      key: 'run',
      frames: [
        { key: 'player_run1' },
        { key: 'player_run2' }
      ],
      frameRate: 8,
      repeat: -1
    });

    // 创建状态文本
    this.stateText = this.add.text(400, 100, 'State: IDLE', {
      fontSize: '32px',
      fill: '#00FFFF',
      fontStyle: 'bold'
    });
    this.stateText.setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 500, 'Press [I] for IDLE | Press [R] for RUN', {
      fontSize: '24px',
      fill: '#FFFFFF'
    }).setOrigin(0.5);

    // 键盘输入监听
    this.keyI = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // 监听按键事件
    this.keyI.on('down', () => {
      this.switchToIdle();
    });

    this.keyR.on('down', () => {
      this.switchToRun();
    });

    // 初始化为 idle 状态
    this.switchToIdle();

    // 添加状态显示（用于验证）
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#FFFF00'
    });
  }

  switchToIdle() {
    if (this.currentState === 'idle') return;
    
    this.currentState = 'idle';
    this.stateText.setText('State: IDLE');
    
    // 停止所有 tween
    this.tweens.killTweensOf(this.player);
    
    // 播放 idle 动画
    this.player.play('idle');
    
    // 重置缩放
    this.player.setScale(1.5);
    
    // 添加缓慢的呼吸效果 tween
    this.tweens.add({
      targets: this.player,
      scaleX: 1.55,
      scaleY: 1.45,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    console.log('Switched to IDLE state');
  }

  switchToRun() {
    if (this.currentState === 'run') return;
    
    this.currentState = 'run';
    this.stateText.setText('State: RUN');
    
    // 停止所有 tween
    this.tweens.killTweensOf(this.player);
    
    // 播放 run 动画
    this.player.play('run');
    
    // 重置缩放
    this.player.setScale(1.5);
    
    // 添加快速的上下跳动 tween
    this.tweens.add({
      targets: this.player,
      y: 280,
      duration: 200,
      yoyo: true,
      repeat: -1,
      ease: 'Quad.easeInOut'
    });

    // 添加轻微的左右晃动
    this.tweens.add({
      targets: this.player,
      angle: -3,
      duration: 200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    console.log('Switched to RUN state');
  }

  update(time, delta) {
    // 更新状态显示
    this.statusText.setText(
      `Current State: ${this.currentState.toUpperCase()}\n` +
      `Animation: ${this.player.anims.currentAnim ? this.player.anims.currentAnim.key : 'none'}\n` +
      `Frame: ${this.player.anims.currentFrame ? this.player.anims.currentFrame.index : 0}`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: GameScene
};

new Phaser.Game(config);