const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let player;
let currentState = 'idle';
let stateChangeCount = 0;
let stateText;
let counterText;
let spaceKey;
let enterKey;

function preload() {
  // 创建红色角色的两帧纹理
  createPlayerTextures.call(this);
}

function createPlayerTextures() {
  // 创建 idle 状态的纹理（正方形）
  const graphics1 = this.add.graphics();
  graphics1.fillStyle(0xff0000, 1);
  graphics1.fillRect(0, 0, 64, 64);
  graphics1.fillStyle(0xffffff, 1);
  graphics1.fillCircle(20, 20, 8); // 左眼
  graphics1.fillCircle(44, 20, 8); // 右眼
  graphics1.fillStyle(0x000000, 1);
  graphics1.fillRect(16, 44, 32, 4); // 嘴巴
  graphics1.generateTexture('player_idle', 64, 64);
  graphics1.destroy();

  // 创建 run 状态帧1（稍微倾斜的形状）
  const graphics2 = this.add.graphics();
  graphics2.fillStyle(0xff3333, 1);
  graphics2.fillRect(0, 0, 64, 64);
  graphics2.fillStyle(0xffffff, 1);
  graphics2.fillCircle(18, 18, 8); // 左眼
  graphics2.fillCircle(46, 22, 8); // 右眼
  graphics2.fillStyle(0x000000, 1);
  graphics2.fillRect(12, 40, 36, 6); // 嘴巴
  graphics2.generateTexture('player_run1', 64, 64);
  graphics2.destroy();

  // 创建 run 状态帧2（另一个姿势）
  const graphics3 = this.add.graphics();
  graphics3.fillStyle(0xff6666, 1);
  graphics3.fillRect(0, 0, 64, 64);
  graphics3.fillStyle(0xffffff, 1);
  graphics3.fillCircle(22, 22, 8); // 左眼
  graphics3.fillCircle(42, 18, 8); // 右眼
  graphics3.fillStyle(0x000000, 1);
  graphics3.fillRect(16, 44, 32, 6); // 嘴巴
  graphics3.generateTexture('player_run2', 64, 64);
  graphics3.destroy();
}

function create() {
  // 创建玩家精灵
  player = this.add.sprite(400, 300, 'player_idle');
  player.setScale(2);

  // 创建 idle 动画（慢速呼吸效果）
  this.anims.create({
    key: 'idle_anim',
    frames: [{ key: 'player_idle' }],
    frameRate: 1,
    repeat: -1
  });

  // 创建 run 动画（快速切换帧）
  this.anims.create({
    key: 'run_anim',
    frames: [
      { key: 'player_run1' },
      { key: 'player_run2' }
    ],
    frameRate: 8,
    repeat: -1
  });

  // 初始播放 idle 动画
  player.play('idle_anim');

  // 初始 idle tween（上下浮动）
  startIdleTween.call(this);

  // 设置键盘输入
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

  // 创建状态显示文本
  stateText = this.add.text(20, 20, 'State: IDLE', {
    fontSize: '28px',
    fill: '#ffffff',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });

  // 创建状态切换计数器
  counterText = this.add.text(20, 60, 'State Changes: 0', {
    fontSize: '24px',
    fill: '#ffff00',
    fontFamily: 'Arial'
  });

  // 创建提示文本
  this.add.text(20, 550, 'Press SPACE for IDLE | Press ENTER for RUN', {
    fontSize: '20px',
    fill: '#aaaaaa',
    fontFamily: 'Arial'
  });

  // 监听按键事件
  spaceKey.on('down', () => {
    switchToIdle.call(this);
  });

  enterKey.on('down', () => {
    switchToRun.call(this);
  });
}

function startIdleTween() {
  // 停止所有现有的 tween
  this.tweens.killTweensOf(player);

  // idle 状态：上下浮动
  this.tweens.add({
    targets: player,
    y: player.y - 30,
    duration: 1500,
    ease: 'Sine.easeInOut',
    yoyo: true,
    repeat: -1
  });

  // 添加缩放呼吸效果
  this.tweens.add({
    targets: player,
    scaleX: 2.1,
    scaleY: 2.1,
    duration: 2000,
    ease: 'Sine.easeInOut',
    yoyo: true,
    repeat: -1
  });
}

function startRunTween() {
  // 停止所有现有的 tween
  this.tweens.killTweensOf(player);

  // run 状态：左右快速移动
  this.tweens.add({
    targets: player,
    x: player.x + 150,
    duration: 800,
    ease: 'Power2',
    yoyo: true,
    repeat: -1
  });

  // 添加轻微的上下抖动
  this.tweens.add({
    targets: player,
    y: player.y - 10,
    duration: 200,
    ease: 'Sine.easeInOut',
    yoyo: true,
    repeat: -1
  });
}

function switchToIdle() {
  if (currentState === 'idle') return;
  
  currentState = 'idle';
  stateChangeCount++;
  
  // 更新文本
  stateText.setText('State: IDLE');
  stateText.setColor('#00ff00');
  counterText.setText('State Changes: ' + stateChangeCount);
  
  // 切换动画
  player.play('idle_anim');
  
  // 切换 tween
  startIdleTween.call(this);
  
  console.log('Switched to IDLE state');
}

function switchToRun() {
  if (currentState === 'run') return;
  
  currentState = 'run';
  stateChangeCount++;
  
  // 更新文本
  stateText.setText('State: RUN');
  stateText.setColor('#ff6600');
  counterText.setText('State Changes: ' + stateChangeCount);
  
  // 切换动画
  player.play('run_anim');
  
  // 切换 tween
  startRunTween.call(this);
  
  console.log('Switched to RUN state');
}

function update(time, delta) {
  // 可以在这里添加额外的更新逻辑
}

new Phaser.Game(config);